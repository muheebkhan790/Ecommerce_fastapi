"use client";

import { useEffect, useState, useCallback } from "react";
import { ordersApi } from "../../../lib/api/orders";
import { formatPrice, getProductImageUrl } from "../../../lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [deletingOrderNum, setDeletingOrderNum] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (id) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const handleStatusChange = async (orderNumber, newStatus) => {
    setUpdatingOrderId(orderNumber);
    setError(null);
    setSuccess(null);
    try {
      const updated = await ordersApi.updateStatus(orderNumber, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? { ...o, status: updated.status } : o))
      );
      setSuccess(`Order ${orderNumber} status updated to "${updated.status}".`);
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(err.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderNumber, status) => {
    if (status !== "completed") {
      setError("Only completed orders can be deleted. Please update the status to 'completed' first.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete completed order "${orderNumber}"?`)) {
      return;
    }

    setDeletingOrderNum(orderNumber);
    setError(null);
    setSuccess(null);

    try {
      await ordersApi.delete(orderNumber);
      setOrders((prev) => prev.filter((o) => o.order_number !== orderNumber));
      if (expandedOrderId && orders.find((o) => o.id === expandedOrderId)?.order_number === orderNumber) {
        setExpandedOrderId(null);
      }
      setSuccess(`Completed order "${orderNumber}" has been deleted.`);
    } catch (err) {
      console.error("Failed to delete order:", err);
      setError(err.message || "Failed to delete completed order");
    } finally {
      setDeletingOrderNum(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Customer Orders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track customer orders, manage statuses, and remove completed orders
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto flex items-center gap-2 cursor-pointer"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
          <span>✓ {success}</span>
          <button onClick={() => setSuccess(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Orders Table Container */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Order Reference</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Address / City</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                    Loading orders from database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                    No orders placed yet. Once customers complete checkout, orders will appear here.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const isCompleted = order.status === "completed";
                  const isDeleting = deletingOrderNum === order.order_number;
                  const isUpdating = updatingOrderId === order.order_number;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-orange-600 dark:text-orange-400">
                          {order.order_number}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {order.customer_name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {order.customer_email}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {order.customer_phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="truncate text-slate-700 dark:text-slate-300">
                          {order.shipping_address}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {order.city}, {order.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {formatPrice(order.total_amount)}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {order.payment_method === "cash_on_delivery" ? "COD" : "Card"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {/* Interactive Status Dropdown */}
                        <div className="flex items-center gap-2">
                          <select
                            disabled={isUpdating}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.order_number, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border outline-none cursor-pointer transition-colors ${
                              order.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : order.status === "processing"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                                : order.status === "cancelled"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            }`}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {isUpdating && <span className="text-[10px] text-slate-400 animate-spin">⏳</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(order.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            {isExpanded ? "Hide ▲" : `${order.items?.length || 0} Items ▼`}
                          </button>

                          {/* Delete option for completed order */}
                          {isCompleted ? (
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteOrder(order.order_number, order.status)}
                              title="Delete this completed order"
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-500/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              <span>🗑️</span>
                              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setError(
                                  `Order ${order.order_number} is "${order.status}". Only completed orders can be deleted. Change status to "Completed" to delete.`
                                )
                              }
                              title="Only completed orders can be deleted"
                              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Order Details Modal / Drawer */}
      {expandedOrderId && (() => {
        const selectedOrder = orders.find((o) => o.id === expandedOrderId);
        if (!selectedOrder) return null;
        return (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-orange-500/30 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Order Details — {selectedOrder.order_number}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customer: {selectedOrder.customer_name} ({selectedOrder.customer_email})
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedOrder.status === "completed" && (
                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(selectedOrder.order_number, selectedOrder.status)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    Delete Completed Order
                  </button>
                )}
                <button
                  onClick={() => setExpandedOrderId(null)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Shipping Destination
                </span>
                <p className="text-slate-900 dark:text-white">{selectedOrder.shipping_address}</p>
                <p className="text-slate-500 dark:text-slate-400">{selectedOrder.city}, {selectedOrder.postal_code} {selectedOrder.country}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Customer Contact
                </span>
                <p className="text-slate-900 dark:text-white">📞 {selectedOrder.customer_phone}</p>
                <p className="text-slate-500 dark:text-slate-400">📧 {selectedOrder.customer_email}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Payment & Status
                </span>
                <p className="text-slate-900 dark:text-white">Method: {selectedOrder.payment_method}</p>
                <p className="text-slate-500 dark:text-slate-400">Status: <span className="font-bold uppercase text-orange-600">{selectedOrder.status}</span></p>
                <p className="text-slate-400 italic">Notes: {selectedOrder.order_notes || "None"}</p>
              </div>
            </div>

            {/* Items table */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ordered Products ({selectedOrder.items?.length || 0})
              </span>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden">
                {selectedOrder.items?.map((item) => {
                  const img = getProductImageUrl(item.product_image_url);
                  return (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                          {img ? (
                            <img src={img} alt={item.product_title} className="w-full h-full object-cover" />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{item.product_title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Unit Price: {formatPrice(item.price)} × {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatPrice(item.subtotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
