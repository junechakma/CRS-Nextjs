import { ImageResponse } from 'next/og'

// Image metadata
export const alt = 'Class Response System - AI-Powered Educational Feedback'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #468cfe 0%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.1) 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            opacity: 0.3,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 80px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              marginBottom: 20,
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            Class Response System
          </div>
          <div
            style={{
              fontSize: 36,
              opacity: 0.95,
              maxWidth: 900,
              lineHeight: 1.3,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            AI-Powered Educational Feedback & Analytics
          </div>
          <div
            style={{
              display: 'flex',
              gap: 30,
              marginTop: 50,
              fontSize: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                borderRadius: 50,
                backdropFilter: 'blur(10px)',
              }}
            >
              🧠 AI Analytics
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                borderRadius: 50,
                backdropFilter: 'blur(10px)',
              }}
            >
              🔒 Anonymous
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                borderRadius: 50,
                backdropFilter: 'blur(10px)',
              }}
            >
              ⚡ Real-time
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
