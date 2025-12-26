// src/pages/finance/CreateInvoicePage.jsx - Create/Edit Invoice with Line Items
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaUser, FaCalendar } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Input, Textarea, Button, Select } from "../../components/common";
import api from "../../api/axiosClient";

export default function CreateInvoicePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [customers, setCustomers] = useState([]);

    const [invoice, setInvoice] = useState({
        customer_id: "",
        customer_name: "",
        due_date: "",
        tax_rate: 18, // GST
        notes: "",
        items: [{ description: "", quantity: 1, unit_price: 0 }],
    });

    useEffect(() => {
        fetchCustomers();
        if (isEditing) {
            fetchInvoice();
        }
    }, [id]);

    const fetchCustomers = async () => {
        try {
            const res = await api.get("/api/crm/customers");
            setCustomers(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch customers");
        }
    };

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/finance/invoices/${id}`);
            if (res.data) {
                setInvoice({
                    ...res.data,
                    items: res.data.items || [{ description: "", quantity: 1, unit_price: 0 }],
                });
            }
        } catch (error) {
            toast.error("Failed to load invoice");
            navigate("/finance/invoices");
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        const customer = customers.find(c => c.id === parseInt(customerId));
        setInvoice({
            ...invoice,
            customer_id: customerId,
            customer_name: customer?.name || "",
        });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...invoice.items];
        newItems[index][field] = field === "quantity" || field === "unit_price"
            ? parseFloat(value) || 0
            : value;
        setInvoice({ ...invoice, items: newItems });
    };

    const addItem = () => {
        setInvoice({
            ...invoice,
            items: [...invoice.items, { description: "", quantity: 1, unit_price: 0 }],
        });
    };

    const removeItem = (index) => {
        if (invoice.items.length === 1) {
            return toast.warning("Invoice must have at least one item");
        }
        const newItems = invoice.items.filter((_, i) => i !== index);
        setInvoice({ ...invoice, items: newItems });
    };

    const calculateSubtotal = () => {
        return invoice.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * (invoice.tax_rate / 100);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!invoice.customer_id && !invoice.customer_name) {
            return toast.error("Please select or enter a customer");
        }

        if (invoice.items.some(item => !item.description || item.unit_price <= 0)) {
            return toast.error("Please fill all item details with valid prices");
        }

        setSaving(true);
        try {
            const payload = {
                ...invoice,
                amount_base: calculateSubtotal(),
                tax_amount: calculateTax(),
                total_amount: calculateTotal(),
            };

            if (isEditing) {
                await api.put(`/api/finance/invoices/${id}`, payload);
                toast.success("Invoice updated successfully");
            } else {
                await api.post("/api/finance/invoices", payload);
                toast.success("Invoice created successfully");
            }
            navigate("/finance/invoices");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to save invoice");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/finance/invoices")}
                    className="p-2 rounded-lg hover:theme-bg-tertiary theme-text-muted"
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">
                        {isEditing ? "Edit Invoice" : "Create Invoice"}
                    </h1>
                    <p className="theme-text-muted text-sm">
                        {isEditing ? "Update invoice details" : "Create a new invoice for your customer"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Customer & Date Section */}
                <Card padding="lg" className="mb-6">
                    <h3 className="font-semibold theme-text-primary mb-4 flex items-center gap-2">
                        <FaUser className="text-blue-500" /> Customer Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Select Customer"
                            value={invoice.customer_id}
                            onChange={handleCustomerChange}
                            options={customers.map(c => ({ value: c.id, label: `${c.name}${c.company_name ? ` - ${c.company_name}` : ''}` }))}
                            placeholder="Select or type below"
                        />
                        <Input
                            label="Or Enter Customer Name"
                            value={invoice.customer_name}
                            onChange={(e) => setInvoice({ ...invoice, customer_name: e.target.value, customer_id: "" })}
                            placeholder="Customer name"
                        />
                        <Input
                            label="Due Date"
                            type="date"
                            value={invoice.due_date}
                            onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
                            required
                            icon={<FaCalendar />}
                        />
                        <Input
                            label="Tax Rate (%)"
                            type="number"
                            value={invoice.tax_rate}
                            onChange={(e) => setInvoice({ ...invoice, tax_rate: parseFloat(e.target.value) || 0 })}
                            min="0"
                            max="100"
                            step="0.5"
                        />
                    </div>
                </Card>

                {/* Line Items */}
                <Card padding="lg" className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold theme-text-primary">Invoice Items</h3>
                        <Button type="button" size="sm" variant="ghost" icon={<FaPlus />} onClick={addItem}>
                            Add Item
                        </Button>
                    </div>

                    {/* Items Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 mb-2 text-sm font-medium theme-text-muted">
                        <div className="col-span-5">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Unit Price</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                        {invoice.items.map((item, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg theme-bg-tertiary"
                            >
                                <div className="col-span-12 md:col-span-5">
                                    <Input
                                        placeholder="Item description"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <Input
                                        type="number"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                        min="1"
                                        className="text-center"
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <Input
                                        type="number"
                                        placeholder="Price"
                                        value={item.unit_price}
                                        onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                                        min="0"
                                        step="0.01"
                                        className="text-right"
                                    />
                                </div>
                                <div className="col-span-3 md:col-span-2 text-right font-semibold theme-text-primary">
                                    ₹{(item.quantity * item.unit_price).toLocaleString("en-IN")}
                                </div>
                                <div className="col-span-1 text-center">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-6 border-t theme-border-light pt-4">
                        <div className="flex flex-col items-end space-y-2">
                            <div className="flex justify-between w-full max-w-xs">
                                <span className="theme-text-muted">Subtotal:</span>
                                <span className="font-medium theme-text-primary">
                                    ₹{calculateSubtotal().toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="flex justify-between w-full max-w-xs">
                                <span className="theme-text-muted">Tax ({invoice.tax_rate}%):</span>
                                <span className="font-medium theme-text-primary">
                                    ₹{calculateTax().toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="flex justify-between w-full max-w-xs pt-2 border-t theme-border-light">
                                <span className="font-semibold theme-text-primary">Total:</span>
                                <span className="text-xl font-bold text-blue-600">
                                    ₹{calculateTotal().toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Notes */}
                <Card padding="lg" className="mb-6">
                    <Textarea
                        label="Notes / Terms"
                        value={invoice.notes}
                        onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                        placeholder="Add any notes, terms, or payment instructions..."
                        rows={4}
                    />
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate("/finance/invoices")}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" icon={<FaSave />} loading={saving}>
                        {isEditing ? "Update Invoice" : "Create Invoice"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
