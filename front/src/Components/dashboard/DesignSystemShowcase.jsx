import React from 'react';
import '../../styles/design-system-proposal.css';

const DesignSystemShowcase = () => {
    return (
        <div className="ds-container">
            <header style={{ marginBottom: 'var(--space-10)', textAlign: 'center' }}>
                <h1 className="ds-heading-1" style={{ color: 'hsl(var(--color-primary-600))' }}>Design System v2.0</h1>
                <p className="ds-subtitle">A unified, accessible, and modern design language for our platform.</p>
            </header>

            <section style={{ marginBottom: 'var(--space-12)' }}>
                <h2 className="ds-heading-2">1. Color Palette</h2>
                <div className="ds-card">
                    <h3 className="ds-heading-3">Primary Action Colors</h3>
                    <p className="ds-body" style={{ marginBottom: 'var(--space-6)' }}>Used for primary buttons, active states, and key highlights.</p>
                    <div className="ds-grid-4">
                        <div>
                            <div className="ds-swatch" style={{ background: 'hsl(var(--color-primary-500))' }}>Primary 500</div>
                            <small className="ds-body">Brand Main</small>
                        </div>
                        <div>
                            <div className="ds-swatch" style={{ background: 'hsl(var(--color-primary-600))' }}>Primary 600</div>
                            <small className="ds-body">Hover State</small>
                        </div>
                        <div>
                            <div className="ds-swatch" style={{ background: 'hsl(var(--color-primary-100))', color: 'hsl(var(--color-primary-800))' }}>Primary 100</div>
                            <small className="ds-body">Background/Accent</small>
                        </div>
                        <div>
                            <div className="ds-swatch" style={{ background: 'hsl(210, 100%, 98%)', color: 'hsl(var(--color-primary-800))', border: '1px solid hsl(var(--color-primary-200))' }}>Primary 50</div>
                            <small className="ds-body">Subtle Wash</small>
                        </div>
                    </div>
                </div>

                <div className="ds-card" style={{ marginTop: 'var(--space-6)' }}>
                    <h3 className="ds-heading-3">Neutral & Text Colors</h3>
                    <div className="ds-grid-4">
                        <div>
                            <div className="ds-swatch" style={{ background: 'hsl(var(--color-neutral-900))' }}>Text 900</div>
                            <small className="ds-body">Primary Text</small>
                        </div>
                        <div>
                            <div className="ds-swatch" style={{ background: 'hsl(var(--color-neutral-600))' }}>Text 600</div>
                            <small className="ds-body">Secondary Text</small>
                        </div>
                        <div>
                            <div className="ds-swatch" style={{ background: 'hsl(var(--color-neutral-400))' }}>Text 400</div>
                            <small className="ds-body">Placeholder / Disabled</small>
                        </div>
                        <div>
                            <div className="ds-swatch" style={{ background: 'hsl(var(--color-neutral-200))', color: 'hsl(var(--color-neutral-600))' }}>Neutral 200</div>
                            <small className="ds-body">Borders / Dividers</small>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: 'var(--space-12)' }}>
                <h2 className="ds-heading-2">2. Typography</h2>
                <div className="ds-card">
                    <div className="ds-grid-2">
                        <div>
                            <h1 className="ds-heading-1">Heading 1</h1>
                            <h2 className="ds-heading-2">Heading 2</h2>
                            <h3 className="ds-heading-3">Heading 3</h3>
                            <p className="ds-subtitle">Subtitle Text (Large)</p>
                            <p className="ds-body">Body Text (Regular) - The quick brown fox jumps over the lazy dog. Highly legible, professional sans-serif typography is crucial for data-heavy applications.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', justifyContent: 'center' }}>
                            <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 'bold' }}>Aa</div>
                            <div className="ds-body">Font Family: Inter, sans-serif</div>
                            <div className="ds-body">We prioritize readability and clean lines for a modern look.</div>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: 'var(--space-12)' }}>
                <h2 className="ds-heading-2">3. Components</h2>
                <div className="ds-grid-2">
                    <div className="ds-card">
                        <h3 className="ds-heading-3">Buttons</h3>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                            <button className="ds-btn ds-btn-primary">Primary Action</button>
                            <button className="ds-btn ds-btn-secondary">Secondary Action</button>
                            <button className="ds-btn ds-btn-ghost">Ghost Button</button>
                        </div>
                    </div>

                    <div className="ds-card">
                        <h3 className="ds-heading-3">Form Inputs</h3>
                        <div className="ds-input-group">
                            <label className="ds-label">Email Address</label>
                            <input type="email" className="ds-input" placeholder="name@company.com" />
                        </div>
                        <div className="ds-input-group">
                            <label className="ds-label">Password</label>
                            <input type="password" className="ds-input" value="SecurePassword123" />
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: 'var(--space-12)' }}>
                <h2 className="ds-heading-2">4. Cards & Elevations</h2>
                <div className="ds-grid-3">
                    <div className="ds-card">
                        <h3 className="ds-heading-3">Standard Card</h3>
                        <p className="ds-body">Used for grouping related content. Features a subtle border and soft shadow.</p>
                    </div>
                    <div className="ds-card" style={{ boxShadow: 'var(--shadow-md)' }}>
                        <h3 className="ds-heading-3">Hover / Elevated</h3>
                        <p className="ds-body">Simulated hover state with slightly stronger shadow for depth.</p>
                    </div>
                    <div className="ds-card" style={{ borderLeft: '4px solid hsl(var(--color-primary-500))' }}>
                        <h3 className="ds-heading-3">Accent Card</h3>
                        <p className="ds-body">Using border accents to denote status or importance.</p>
                    </div>
                </div>
            </section>

            <footer style={{ marginTop: 'var(--space-12)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <small>Proposed Design System for E-Commerce Admin Dashboard</small>
            </footer>
        </div>
    );
};

export default DesignSystemShowcase;
