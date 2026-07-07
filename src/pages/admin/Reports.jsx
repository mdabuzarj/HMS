import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'

// ─── Nav ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  'Dashboard', 'Patients', 'Appointments', 'Doctors', 'Staff',
  'OP', 'IP', 'Prescriptions', 'Pharmacy', 'Laboratory',
  'Vehicles', 'Finance', 'Follow-ups', 'Reports', 'Settings',
]

const REPORT_TYPES = [
  'Patient Reports', 'Doctor Reports', 'Revenue Reports', 'Expense Reports',
  'Inventory Reports', 'Lab Reports', 'Follow-up Reports',
]

// ─── Report cards data ─────────────────────────────────────────────────────────
const REPORTS = [
  { id: 'patient',  icon: '👥', title: 'Patient Reports',  desc: 'Registration, demographics, visit counts' },
  { id: 'doctor',   icon: '🩺', title: 'Doctor Reports',   desc: 'Consultation stats, revenue by doctor'    },
  { id: 'revenue',  icon: '💰', title: 'Revenue Reports',  desc: 'Daily, monthly, yearly income'            },
  { id: 'expense',  icon: '📊', title: 'Expense Reports',  desc: 'Category-wise expense breakdown'          },
  { id: 'inventory',icon: '💊', title: 'Inventory Reports',desc: 'Stock levels, purchases, usage'           },
  { id: 'lab',      icon: '🧪', title: 'Lab Reports',      desc: 'Test counts, pending, completed'          },
  { id: 'followup', icon: '📞', title: 'Follow-up Reports',desc: 'Completion rates, missed follow-ups'      },
]

// ─── Top bar ──────────────────────────────────────────────────────────────────
function AdminTopBar({ breadcrumb, search, onSearch }) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100
                       flex items-center justify-between px-6 py-3 gap-4">
      <p className="text-sm text-gray-500 font-medium">
        MediCore HMS
        <span className="mx-1.5 text-gray-300">/</span>
        <span className="text-gray-800 font-semibold">{breadcrumb}</span>
      </p>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input value={search} onChange={e => onSearch(e.target.value)}
            placeholder="Quick search..."
            className="text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-1.5
                       w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600" />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
        </div>
        <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition">
          <span className="text-lg">🔔</span>
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white
                           text-[9px] font-bold rounded-full flex items-center justify-center">9</span>
        </button>
        <div className="flex items-center -space-x-2">
          <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white
                          flex items-center justify-center text-white text-xs font-bold">A</div>
          <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white
                          flex items-center justify-center text-white text-xs font-bold">S</div>
        </div>
        <span className="text-sm font-medium text-gray-700">Super Admin</span>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 text-lg">⎋</button>
      </div>
    </header>
  )
}

// ─── Report card ────────────────────────────────────────────────────────────────
function ReportCard({ report, onView, onPdf }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5
                    hover:shadow-md transition-shadow">
      <div className="text-2xl mb-3">{report.icon}</div>
      <h4 className="font-semibold text-gray-800 text-sm mb-1">{report.title}</h4>
      <p className="text-xs text-gray-400 mb-4 leading-relaxed">{report.desc}</p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(report)}
          className="flex items-center gap-1.5 text-xs text-gray-600 font-medium
                     border border-gray-200 rounded-lg px-3 py-1.5
                     hover:bg-gray-50 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414
                 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View
        </button>
        <button
          onClick={() => onPdf(report)}
          className="flex items-center gap-1.5 text-xs text-gray-600 font-medium
                     border border-gray-200 rounded-lg px-3 py-1.5
                     hover:bg-gray-50 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H8a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1
                 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
function Reports() {
  const navigate              = useNavigate()
  const [activeLink, setActiveLink] = useState('Reports')
  const [search, setSearch]         = useState('')

  // Filter & Generate form state
  const [reportType, setReportType] = useState('')
  const [fromDate, setFromDate]     = useState('')
  const [toDate, setToDate]         = useState('')

  const handleGenerate = () => {
    if (!reportType) return
    // TODO: connect to backend / API
    console.log('Generating', reportType, fromDate, toDate)
  }

  const handleView = (report) => {
    // TODO: navigate to detailed report view
    console.log('View', report.id)
  }

  const handlePdf = (report) => {
    // TODO: trigger PDF export
    console.log('PDF', report.id)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      <Sidebar
        links={NAV_LINKS}
        activeLink={activeLink}
        onLinkClick={(link) => {
          setActiveLink(link)
          if (link === 'Dashboard')  navigate('/admin')
          if (link === 'Doctors')    navigate('/admin/doctors')
          if (link === 'Staff')      navigate('/admin/staff')
          if (link === 'IP')         navigate('/admin/ip')
          if (link === 'Vehicles')   navigate('/admin/vehicles')
          if (link === 'Finance')    navigate('/admin/finance')
          if (link === 'Follow-ups') navigate('/admin/followups')
          if (link === 'Reports')    navigate('/admin/reports')
        }}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <AdminTopBar breadcrumb="Reports" search={search} onSearch={setSearch} />

        <main className="flex-1 p-6">

          {/* Page heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
            <p className="text-sm text-gray-400 mt-0.5">Generate and export hospital reports</p>
          </div>

          {/* Filter & Generate card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">Filter &amp; Generate</h3>

            <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Report Type</label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                             bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select report type</option>
                  {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                             bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                             bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
                           px-6 py-2.5 rounded-lg transition whitespace-nowrap"
              >
                Generate
              </button>

              <button
                title="Download"
                className="border border-gray-200 text-gray-500 p-2.5 rounded-lg
                           hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Report cards grid — 3 columns */}
          <div className="grid grid-cols-3 gap-4">
            {REPORTS.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onView={handleView}
                onPdf={handlePdf}
              />
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}

export default Reports