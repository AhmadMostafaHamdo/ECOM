import React from 'react';
import '../../styles/design-system-proposal.css';

const DesignSystemShowcase = () => {
    return (
        <div className="admin_page">
            <header className="admin_page_header" style={{ marginBottom: '60px' }}>
                <p className="admin_page_kicker">Design Infrastructure</p>
                <h1>Core Design System</h1>
                <p>A premium, unified visual language for building professional administrative interfaces.</p>
            </header>

            <section style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#0f172a' }}>Typography Grid</h2>
                <div className="admin_table_container" style={{ padding: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 12px' }}>Display Large</h1>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 12px' }}>Heading Bold</h2>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 12px' }}>Section Label</h3>
                            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>This is the standard body text used for descriptions and data labels throughout the dashboard.</p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--color-primary)' }}>Aa</div>
                            <div style={{ fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Primary Font: Outfit / Inter</div>
                            <p style={{ lineHeight: '1.6', fontSize: '14px' }}>We use a combination of Outfit for headings to provide a modern, premium feel, and Inter for body text to ensure maximum legibility for data-heavy views.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#0f172a' }}>Standard Components</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    <div className="admin_form_card" style={{ margin: 0 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px' }}>Action Buttons</h3>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button className="admin_btn primary">Primary Action</button>
                            <button className="admin_btn secondary">Secondary Action</button>
                            <button className="admin_btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Danger Action</button>
                            <button className="admin_btn sm primary">Small Action</button>
                        </div>
                    </div>

                    <div className="admin_form_card" style={{ margin: 0 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px' }}>Input Controls</h3>
                        <div className="admin_form">
                            <label>Data Entry Label</label>
                            <input type="text" placeholder="Standard input field..." />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', borderRadius: '6px' }}>HELPFUL HINT</span>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Input validation example</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', color: '#0f172a' }}>Data Visuals</h2>
                <div className="admin_stats_grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <article className="admin_stat_card">
                        <div style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.08)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path></svg>
                        </div>
                        <h3>Metric Title</h3>
                        <p>1,284</p>
                        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', marginTop: '8px' }}>+12.5% increase</div>
                    </article>

                    <article className="admin_stat_card" style={{ background: 'var(--admin-sidebar-gradient)', color: 'white', border: 'none' }}>
                        <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dark Mode Card</h3>
                        <p style={{ color: 'white', fontSize: '24px', margin: '12px 0' }}>$42,850.00</p>
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '70%', height: '100%', background: 'var(--color-primary)' }}></div>
                        </div>
                    </article>

                    <article className="admin_stat_card">
                        <h3 style={{ fontSize: '14px', marginBottom: '16px' }}>Status Badges</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>SUCCESS</span>
                            <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>PENDING</span>
                            <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>CRITICAL</span>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    );
};

export default DesignSystemShowcase;
