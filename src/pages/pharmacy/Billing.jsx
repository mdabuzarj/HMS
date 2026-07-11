import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import StatsCard from '../../components/common/StatsCard'
import { useBills, usePatients } from '../../store/hospitalStore'

const NAV_LINKS = [
  "Dashboard",
  "Medicine Inventory",
  "Add Medicine",
  "Prescription Queue",
  "Dispense Medicine",
  "Billing",
]

const MODE_STYLES = {
  Cash:      "bg-gray-100 text-gray-600",
  Card:      "bg-blue-100 text-blue-600",
  Insurance: "bg-purple-100 text-purple-600",
  UPI:       "bg-green-100 text-green-600",
}

function Billing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeLink, setActiveLink] = useState("Billing")
  const [search, setSearch] = useState("")
  const [modeFilter, setModeFilter] = useState("All")   // NEW
  const [viewing, setViewing] = useState(null)           // NEW

  // ── Shared store ──
  const { bills } = useBills()
  const patients = usePatients()

  const handleNavClick = (link) => {
    setActiveLink(link)
    if (link === "Dashboard")          navigate('/pharmacy')
    if (link === "Medicine Inventory") navigate('/pharmacy/inventory')
    if (link === "Add Medicine")       navigate('/pharmacy/add-medicine')
    if (link === "Prescription Queue") navigate('/pharmacy/prescriptions')
    if (link === "Dispense Medicine")  navigate('/pharmacy/dispense')
    if (link === "Billing")            navigate('/pharmacy/billing')
  }

  const enriched = bills.map(b => ({
    ...b,
    patientName: patients.find(p => p.id === b.patientId)?.name || b.patientId,
  }))

  // REPLACED: search-only filter is now search + mode filter
  const filteredBills = enriched.filter(b => {
    const matchesSearch = b.patientName.toLowerCase().includes(search.toLowerCase()) ||
      b.billId.toLowerCase().includes(search.toLowerCase())
    const matchesMode = modeFilter === "All" || b.mode === modeFilter
    return matchesSearch && matchesMode
  })

  // Derived stats — real, from the store
  const todaysRevenue = bills.reduce((sum, b) => sum + (b.net || 0), 0)
  const billsRaised = bills.length
  const insuranceTotal = bills.filter(b => b.mode === "Insurance").reduce((sum, b) => sum + (b.net || 0), 0)
  const pendingTotal = bills.filter(b => b.status === "Partial" || b.status === "Pending")
    .reduce((sum, b) => sum + (b.net || 0), 0)

  // NEW: print handler
  const handlePrint = (b) => {
    const win = window.open("", "_blank")
    win.document.write(`
      <html><head><title>${b.billId}</title></head>
      <body style="font-family:sans-serif;padding:24px">
        <h2>Pharmacy Bill — ${b.billId}</h2>
        <p>Patient: ${b.patientName}</p>
        <p>Items: ${b.items}</p>
        <p>Gross: ₹${b.gross} | Discount: ₹${b.discount} | Net: ₹${b.net}</p>
        <p>Payment Mode: ${b.mode} | Status: ${b.status}</p>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar links={NAV_LINKS} activeLink={activeLink} onLinkClick={handleNavClick} />

      <main className="flex-1 p-6 overflow-auto">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pharmacy Billing History</h2>
          <p className="text-sm text-gray-400">Create bills for OTC and prescription medicines</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatsCard icon="💲" label="Total Revenue"     value={`₹${todaysRevenue.toLocaleString('en-IN')}`} />
          <StatsCard icon="📄" label="Bills Raised"      value={billsRaised} />
          <StatsCard icon="💳" label="Insurance Claims"  value={`₹${insuranceTotal.toLocaleString('en-IN')}`} />
          <StatsCard icon="⏰" label="Pending"           value={`₹${pendingTotal.toLocaleString('en-IN')}`} />
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search bill or patient..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* REPLACED: static Filter button → working dropdown */}
            <select
              value={modeFilter}
              onChange={e => setModeFilter(e.target.value)}
              className="border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition whitespace-nowrap focus:outline-none"
            >
              <option value="All">▽ All Modes</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Insurance">Insurance</option>
              <option value="UPI">UPI</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">Bill #</th>
                  <th className="pb-3 font-medium">Patient</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Gross</th>
                  <th className="pb-3 font-medium">Discount</th>
                  <th className="pb-3 font-medium">Net</th>
                  <th className="pb-3 font-medium">Mode</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(b => (
                  <tr key={b.billId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 font-mono text-xs text-gray-500">{b.billId}</td>
                    <td className="py-3 font-medium text-gray-800">{b.patientName}</td>
                    <td className="py-3 text-gray-500">{b.items} items</td>
                    <td className="py-3 text-gray-700">₹{b.gross}</td>
                    <td className={`py-3 ${b.discount > 0 ? "text-green-500" : "text-gray-400"}`}>
                      -₹{b.discount}
                    </td>
                    <td className="py-3 font-semibold text-gray-800">₹{b.net}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${MODE_STYLES[b.mode] || "bg-gray-100 text-gray-600"}`}>
                        {b.mode}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => handlePrint(b)} className="text-xs text-gray-500 hover:text-gray-700 mr-3">🖨 Print</button>
                      <button onClick={() => setViewing(b)} className="text-xs text-gray-500 hover:text-gray-700">👁 View</button>
                    </td>
                  </tr>
                ))}
                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400 text-sm">
                      No bills found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* NEW: View modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-4">Bill {viewing.billId}</h3>
            <div className="text-sm text-gray-600 flex flex-col gap-2">
              <p><span className="text-gray-400">Patient:</span> {viewing.patientName}</p>
              <p><span className="text-gray-400">Items:</span> {viewing.items}</p>
              <p><span className="text-gray-400">Gross:</span> ₹{viewing.gross}</p>
              <p><span className="text-gray-400">Discount:</span> ₹{viewing.discount}</p>
              <p><span className="text-gray-400">Net:</span> ₹{viewing.net}</p>
              <p><span className="text-gray-400">Mode:</span> {viewing.mode}</p>
              <p><span className="text-gray-400">Status:</span> {viewing.status}</p>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setViewing(null)} className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Billing