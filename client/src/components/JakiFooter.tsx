export function JakiFooter() {
  return (
    <footer 
      style={{
        backgroundColor: '#0d0d0d',
        color: '#ffffff',
        textAlign: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}
      data-testid="jaki-footer"
    >
      <p style={{ margin: '6px 0', fontSize: '16px' }}>
        <strong>Contact:</strong>{' '}
        <a 
          href="mailto:jakiinfo.global@gmail.com" 
          style={{ color: '#00aced', textDecoration: 'none' }}
          data-testid="link-contact-email"
        >
          jakiinfo.global@gmail.com
        </a>
      </p>
      <p style={{ margin: '6px 0', fontSize: '16px' }}>
        <strong>Please donate:</strong>{' '}
        <span style={{ fontWeight: 'bold', color: '#ff4d4d' }}>$26KG1</span>
      </p>
      <p style={{ margin: '6px 0', fontSize: '13px', opacity: 0.7 }}>
        © 2025 Jaki Global. All rights reserved.
      </p>
    </footer>
  );
}
