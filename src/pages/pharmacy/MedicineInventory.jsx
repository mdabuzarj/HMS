import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import StatsCard from '../../components/common/StatsCard'
import { useMedicines } from '../../store/hospitalStore'

const NAV_LINKS = [
  "Dashboard",
  "Medicine Inventory",
  "Add Medicine",
  "Prescription Queue",
  "Dispense Medicine",
  "Billing",
]

const STATUS_STYLES = {
  "In Stock":     "bg-green-100 text-green-700",
  "Low Stock":    "bg-yellow-100 text-yellow-700",
  "Expiring Soon":"bg-blue-100 text-blue-700",
  "Out of Stock": "bg-red-100 text-red-700",
}

function deriveStatus(m) {
  if (m.stock === 0) return "Out of Stock"
  if (m.stock < m.reorderLevel) return "Low Stock"
  if (m.status === "Expiring Soon") return "Expiring Soon"
  return "In Stock"
}

function MedicineInventory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeLink, setActiveLink] = useState("Medicine Inventory")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [editing, setEditing] = useState(null)

  // ── Shared store ── (must be declared before anything below uses it)
  const { medicines, restockMedicine, updateMedicine } = useMedicines()

  const handleNavClick = (link) => {
    setActiveLink(link)
    if (link === "Dashboard")          navigate('/pharmacy')
    if (link === "Add Medicine")       navigate('/pharmacy/add-medicine')
    if (link === "Prescription Queue") navigate('/pharmacy/prescriptions')
    if (link === "Dispense Medicine")  navigate('/pharmacy/dispense')
    if (link === "Billing")            navigate('/pharmacy/billing')
    if (link === "Medicine Inventory") navigate('/pharmacy/inventory')
  }

  const enriched = medicines.map(m => ({ ...m, liveStatus: deriveStatus(m) }))

  const filtered = enriched.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.generic || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "All" || m.liveStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalItems      = medicines.length
  const inStockCount    = enriched.filter(m => m.liveStatus === "In Stock").length
  const lowStockCount   = enriched.filter(m => m.liveStatus === "Low Stock").length
  const expiringCount   = enriched.filter(m => m.liveStatus === "Expiring Soon").length

  const handleExport = () => {
    const headers = ["Name", "Generic", "Category", "Stock", "Batch", "Expiry", "Price", "ReorderLevel", "Status"]
    const rows = filtered.map(m => [m.name, m.generic, m.category, m.stock, m.batch, m.expiry, m.price, m.reorderLevel, m.liveStatus])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "medicine_inventory.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRestock = (m) => {
    const qtyStr = prompt(`Restock quantity for ${m.name}:`, "50")
    const qty = parseInt(qtyStr, 10)
    if (!isNaN(qty) && qty > 0) restockMedicine(m.name, qty)
  }

  const handleSaveEdit = (updates) => {
    updateMedicine(editing.name, updates)
    setEditing(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar links={NAV_LINKS} activeLink={activeLink} onLinkClick={handleNavClick} />

      <main className="flex-1 p-6 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Medicine Inventory</h2>
            <p className="text-sm text-gray-400">Manage all pharmaceutical stock</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              ⬇ Export
            </button>
            <button
              onClick={() => navigate('/pharmacy/add-medicine')}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              + Add Medicine
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatsCard icon="📦" label="Total Items"    value={totalItems} />
          <StatsCard icon="✅" label="In Stock"        value={inStockCount} />
          <StatsCard icon="⚠️" label="Low Stock"       value={lowStockCount} subColor="text-yellow-500" />
          <StatsCard icon="⛔" label="Expiring Soon"   value={expiringCount}  subColor="text-red-500" />
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

          <div className="flex items-center gap-3 mb-5">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search medicine..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition whitespace-nowrap focus:outline-none"
            >
              <option value="All">▽ All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Expiring Soon">Expiring Soon</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">Medicine Name</th>
                  <th className="pb-3 font-medium">Generic</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Batch No.</th>
                  <th className="pb-3 font-medium">Expiry</th>
                  <th className="pb-3 font-medium">Unit Price</th>
                  <th className="pb-3 font-medium">Reorder Level</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={`${m.name}-${i}`} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 font-medium text-gray-800">{m.name}</td>
                    <td className="py-3 text-gray-400">{m.generic}</td>
                    <td className="py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{m.category}</span>
                    </td>
                    <td className={`py-3 font-medium ${m.stock === 0 ? "text-red-500" : m.stock < m.reorderLevel ? "text-red-500" : "text-gray-700"}`}>
                      {m.stock}
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{m.batch}</td>
                    <td className={`py-3 text-xs ${m.liveStatus === "Expiring Soon" ? "text-orange-500 font-medium" : "text-gray-500"}`}>
                      {m.expiry}
                    </td>
                    <td className="py-3 text-gray-700">₹{m.price}</td>
                    <td className="py-3 text-gray-500">{m.reorderLevel}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[m.liveStatus] || "bg-gray-100 text-gray-600"}`}>
                        {m.liveStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <button onClick={() => setEditing(m)} className="text-xs text-gray-500 hover:text-gray-700 mr-3">✏ Edit</button>
                      <button onClick={() => handleRestock(m)} className="text-xs border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition">+ Restock</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-400 text-sm">
                      No medicines found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-4">Edit {editing.name}</h3>
            <form
              onSubmit={e => {
                e.preventDefault()
                const form = new FormData(e.target)
                handleSaveEdit({
                  price: parseFloat(form.get("price")),
                  reorderLevel: parseInt(form.get("reorderLevel"), 10),
                  batch: form.get("batch"),
                  expiry: form.get("expiry"),
                })
              }}
              className="flex flex-col gap-3"
            >
              <label className="text-xs text-gray-500">Price
                <input name="price" type="number" defaultValue={editing.price} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
              </label>
              <label className="text-xs text-gray-500">Reorder Level
                <input name="reorderLevel" type="number" defaultValue={editing.reorderLevel} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
              </label>
              <label className="text-xs text-gray-500">Batch No.
                <input name="batch" defaultValue={editing.batch} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
              </label>
              <label className="text-xs text-gray-500">Expiry
                <input name="expiry" defaultValue={editing.expiry} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
              </label>
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => setEditing(null)} className="text-sm px-4 py-2 rounded-lg border border-gray-200">Cancel</button>
                <button type="submit" className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicineInventory