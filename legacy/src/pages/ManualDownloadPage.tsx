import { Link } from 'react-router-dom'
import { Download, FileText, Users, GraduationCap, Building2, ArrowLeft } from 'lucide-react'
import Button from '../shared/components/ui/Button'
import { Card } from '../shared/components/ui'

export default function ManualDownloadPage() {
  const manuals = [
    {
      title: 'Student Manual',
      description: 'Complete guide for students on how to provide anonymous feedback using session access keys',
      filename: 'Student_Manual.pdf',
      icon: <GraduationCap className="w-8 h-8" />,
      color: 'blue',
      features: [
        'Anonymous feedback access',
        'Session key usage',
        'Rating questions',
        'Comment submission'
      ]
    },
    {
      title: 'Teacher Manual', 
      description: 'Comprehensive guide for teachers on course management and response session creation',
      filename: 'Teacher_Manual.pdf',
      icon: <Users className="w-8 h-8" />,
      color: 'green',
      features: [
        'Course management',
        'Session creation',
        'Analytics dashboard',
        'Response monitoring'
      ]
    },
    {
      title: 'University Admin Manual',
      description: 'Administrative guide for university-level management and system configuration',
      filename: 'University_Admin_Manual.pdf', 
      icon: <Building2 className="w-8 h-8" />,
      color: 'purple',
      features: [
        'Faculty management',
        'Department setup',
        'Teacher assignments',
        'Question templates'
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600', 
        button: 'bg-green-600 hover:bg-green-700',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700',
        border: 'border-purple-200'
      }
    }
    return colors[color as keyof typeof colors]
  }

  const downloadManual = (filename: string) => {
    window.open(`/${filename}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link 
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex-1 text-center text-2xl font-bold text-blue-600">
              CRS Manuals
            </div>
            {/* Spacer to balance the layout */}
            <div className="w-[120px]"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            User Manuals
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive guides for all user roles in the Class Response System
          </p>
        </div>

        {/* Manuals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {manuals.map((manual, index) => {
            const colorClasses = getColorClasses(manual.color)
            
            return (
              <Card key={index} className={`${colorClasses.border} border-2`}>
                <div className="p-6">
                  <div className={`${colorClasses.bg} rounded-lg p-4 mb-4 text-center`}>
                    <div className={`${colorClasses.icon} inline-block`}>
                      {manual.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {manual.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {manual.description}
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {manual.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => downloadManual(manual.filename)}
                    className={`w-full ${colorClasses.button} text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Need Help?
              </h2>
              <p className="text-gray-600 mb-6">
                If you need additional support or have questions about using the Class Response System, 
                please refer to the appropriate manual for your role or contact your system administrator.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/feedback">
                  <Button variant="secondary" size="sm">
                    Student Feedback Portal
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="sm">
                    Staff Login
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}