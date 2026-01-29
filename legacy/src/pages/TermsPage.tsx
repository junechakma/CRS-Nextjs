import { Link } from 'react-router-dom'
import Button from '../shared/components/ui/Button'

export default function TermsPage() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-6">
                By accessing and using the CRS Feedback System ("the System"), you accept and agree to be bound by the terms and provision of this agreement. These terms apply to all users of the system including Students, Teachers, Department Moderators, Faculty Admins, University Admins, and Super Admins.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. System Purpose and Usage</h2>
              <p className="text-gray-700 mb-4">
                The CRS Feedback System is designed exclusively for educational feedback collection and institutional quality improvement. Users agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Use the system only for legitimate educational feedback purposes</li>
                <li>Provide accurate and honest information in all interactions</li>
                <li>Respect the confidentiality and anonymity of response submissions</li>
                <li>Not attempt to identify anonymous respondents</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Roles and Responsibilities</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Students</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Provide honest and constructive feedback</li>
                <li>Use access keys only for legitimate evaluation sessions</li>
                <li>Respect the time limits of feedback sessions</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Teachers</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Create feedback sessions responsibly and professionally</li>
                <li>Protect session access keys and distribute them appropriately</li>
                <li>Use feedback data constructively for teaching improvement</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Administrative Users</h3>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>Maintain data confidentiality and privacy</li>
                <li>Use administrative privileges ethically and professionally</li>
                <li>Ensure compliance with institutional policies</li>
                <li>Protect user credentials and system security</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Privacy and Security</h2>
              <p className="text-gray-700 mb-6">
                The system maintains strict data privacy standards. Anonymous feedback submissions cannot be traced back to individual students. Administrative users with access to aggregated data must maintain confidentiality and use information solely for educational improvement purposes.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Account Security</h2>
              <p className="text-gray-700 mb-6">
                Users are responsible for maintaining the security of their accounts, including password protection and appropriate logout procedures. Any suspected security breaches should be reported immediately to system administrators.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">Users must not:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Attempt to breach system security or access unauthorized areas</li>
                <li>Submit false, misleading, or malicious feedback</li>
                <li>Share access credentials with unauthorized individuals</li>
                <li>Use the system for any illegal or inappropriate purposes</li>
                <li>Attempt to identify anonymous respondents</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. System Availability</h2>
              <p className="text-gray-700 mb-6">
                While we strive to maintain continuous system availability, we cannot guarantee uninterrupted access. The system may be temporarily unavailable due to maintenance, updates, or technical issues.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Modifications to Terms</h2>
              <p className="text-gray-700 mb-6">
                These terms may be updated periodically. Users will be notified of significant changes, and continued use of the system constitutes acceptance of updated terms.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Termination</h2>
              <p className="text-gray-700 mb-6">
                User accounts may be suspended or terminated for violations of these terms or inappropriate use of the system. Institutional administrators reserve the right to revoke access as needed.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these terms or system usage, please contact your institutional administrator or system support team.
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