import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Home() {
  return (
    <Layout
      title="Seat Picker"
      description="Flexible, interactive, and beautiful seat layout editor and viewer for React"
    >
      <main
        style={{
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          minHeight: '100vh',
        }}
      >
        {/* Hero Section */}
        <div style={{ padding: '3rem 0 2rem 0', textAlign: 'center' }}>
          <div className="container">
            <h1 className='text-[2.5rem] font-bold text-gray-800'>
              🎟️ Seat Picker
            </h1>
            <p
              style={{
                fontSize: '1.25rem',
                color: '#444',
                margin: '1rem 0 0.5rem 0',
              }}
            >
              Flexible, interactive, and beautiful seat layout editor and viewer
              for React.
              <br />
              Design, manage, and share seating arrangements for events,
              theaters, venues, and more—with zero hassle.
            </p>
            <div style={{ margin: '2rem 0' }}>
              <img
                src={useBaseUrl('/img/seat-picker-hero.png')}
                alt="Seat Picker Demo"
                style={{
                  maxWidth: 400,
                  borderRadius: 12,
                  boxShadow: '0 4px 32px #0001',
                }}
              />
            </div>
            <div>
              <Link
                className="button button--primary button--lg mr-4"
                to={useBaseUrl('/docs/intro')}
              >
                Get Started
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="https://stackblitz.com/edit/seat-picker-demo"
              >
                Try Live Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section
          className="container"
          style={{ marginTop: '3rem', marginBottom: '3rem' }}
        >
          <div className="row">
            <div className="col col--4">
              <h3>🎨 Interactive Canvas</h3>
              <ul>
                <li>Drag, drop, and arrange seats, shapes, and text</li>
                <li>Multi-select, group, and bulk edit</li>
                <li>Grid arrangement and smart snapping</li>
                <li>Zoom (80%–120%) and pan</li>
              </ul>
            </div>
            <div className="col col--4">
              <h3>🛠️ Customizable & Powerful</h3>
              <ul>
                <li>Custom toolbar, sidebar, and modals</li>
                <li>Style everything with props or CSS</li>
                <li>Export/import layouts as JSON</li>
                <li>TypeScript support</li>
              </ul>
            </div>
            <div className="col col--4">
              <h3>👥 Customer-Ready</h3>
              <ul>
                <li>Read-only viewer with drag & drop upload</li>
                <li>Seat details modal and purchase actions</li>
                <li>Easy integration with your backend</li>
                <li>Open source & MIT licensed</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Screenshots Section */}
        <section
          className="container"
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 className="mb-4 text-2xl font-bold">🖼️ Screenshots</h2>
          <img
            src={useBaseUrl('/img/seat-picker-canvas.png')}
            alt="Seat Picker Canvas"
            style={{
              maxWidth: 350,
              margin: '0 1rem',
              borderRadius: 8,
              boxShadow: '0 2px 16px #0001',
            }}
          />
          <img
            src={useBaseUrl('/img/seat-picker-modal.png')}
            alt="Seat Details Modal"
            style={{
              maxWidth: 350,
              margin: '0 1rem',
              borderRadius: 8,
              boxShadow: '0 2px 16px #0001',
            }}
          />
        </section>

        {/* How it Works */}
        <section className="container" style={{ marginBottom: '3rem' }}>
          <h2 className="mb-4 text-2xl font-bold">How It Works</h2>
          <ol>
            <li>
              Install with <code>npm install seat-picker</code>
            </li>
            <li>
              Import and use <code>{`<SeatPicker />`}</code> in your React app
            </li>
            <li>Design, export, and share your seat layouts</li>
            <li>Let customers view and purchase seats in read-only mode</li>
          </ol>
        </section>

        {/* Call to Action */}
        <section
          className="container"
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h2 className="mb-2 text-xl font-bold">
            Ready to build your perfect seat map?
          </h2>
          <Link
            className="button button--primary button--lg"
            to={useBaseUrl('/docs/intro')}
          >
            Get Started
          </Link>
        </section>
      </main>
    </Layout>
  );
}
