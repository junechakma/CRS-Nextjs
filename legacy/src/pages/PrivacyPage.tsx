import { Link } from 'react-router-dom'
import Button from '../shared/components/ui/Button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <nav className="flex justify-between items-center mb-8">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            CRS Feedback System
          </Link>
          <div className="flex gap-4">
            <Link to="/">
              <Button variant="secondary" size="sm">Home</Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Login</Button>
            </Link>
          </div>
        </nav>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Administrative User Information</h3>
              <p className="text-gray-700 mb-4">
                We collect the following information from administrative users (Teachers, Department Moderators, Faculty Admins, University Admins, Super Admins):
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Name and professional credentials</li>
                <li>Institutional email address</li>
                <li>Role and department affiliation</li>
                <li>Account creation and login timestamps</li>
                <li>System usage patterns and session data</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Student Response Data</h3>
              <p className="text-gray-700 mb-6">
                Student feedback submissions are collected anonymously. We do not collect or store any personally identifiable information from students participating in feedback sessions. Only response content, timestamps, and associated course/session identifiers are stored.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Information</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Educational Improvement</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Generating aggregate feedback reports for teaching quality assessment</li>
                <li>Providing analytics to help improve educational delivery</li>
                <li>Enabling institutional decision-making based on feedback trends</li>
                <li>Supporting professional development initiatives</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">System Administration</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>User account management and authentication</li>
                <li>System security monitoring and maintenance</li>
                <li>Performance optimization and troubleshooting</li>
                <li>Compliance with institutional policies</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Data Security Measures</h2>
              <p className="text-gray-700 mb-4">
                We implement comprehensive security measures to protect user data:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Encrypted data transmission using HTTPS protocols</li>
                <li>Secure database storage with access controls</li>
                <li>Role-based authentication and authorization systems</li>
                <li>Regular security audits and updates</li>
                <li>Anonymous feedback collection to protect student privacy</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or transfer personal information to third parties. Data may be shared only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Within the institutional hierarchy according to defined access levels</li>
                <li>When required by law or institutional policy</li>
                <li>For system maintenance by authorized technical personnel</li>
                <li>In aggregate, non-identifiable form for research purposes (with institutional approval)</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Student Privacy Protection</h2>
              <p className="text-gray-700 mb-4">
                We maintain strict anonymity for student feedback:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>No personal identifiers are collected during feedback sessions</li>
                <li>Session access is granted through anonymous keys</li>
                <li>Response submissions cannot be traced back to individual students</li>
                <li>Aggregate reporting prevents identification of individual responses</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-6">
                We retain data according to institutional policies and educational requirements. Anonymous feedback data may be retained indefinitely for long-term trend analysis. Administrative user data is retained while accounts remain active and for a reasonable period thereafter as required by institutional record-keeping policies.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. User Rights and Controls</h2>
              <p className="text-gray-700 mb-4">
                Administrative users have the following rights:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Access to their personal account information</li>
                <li>Ability to update profile and password information</li>
                <li>Request for account deactivation through proper institutional channels</li>
                <li>Information about how their data is being used within the system</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-6">
                The system uses essential cookies for authentication and session management. We do not use tracking cookies for advertising or non-essential purposes. Users can manage cookie preferences through their browser settings, though disabling essential cookies may affect system functionality.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Updates to Privacy Policy</h2>
              <p className="text-gray-700 mb-6">
                This privacy policy may be updated to reflect changes in our practices or regulatory requirements. Users will be notified of significant changes, and the updated policy will be posted with a new effective date.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Information</h2>
              <p className="text-gray-700">
                For questions about this privacy policy, data handling practices, or to exercise your privacy rights, please contact your institutional administrator or system privacy officer.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link to="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}