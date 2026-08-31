import { useState, useEffect } from 'react'
import supabase from '../supabaseClient'

export default function AdminBioConfig() {
    const [configs, setConfigs] = useState([])
    const [newField, setNewField] = useState({ label: '', key_name: '', field_type: 'text', is_required: false })

    useEffect(() => { fetchConfig() }, [])

    async function fetchConfig() {
        const { data } = await supabase.from('bio_config').select('*').order('urutan', { ascending: true })
        if (data) setConfigs(data)
    }

    async function toggleActive(id, currentStatus) {
        await supabase.from('bio_config').update({ is_active: !currentStatus }).eq('id', id)
        fetchConfig()
    }

    async function handleAdd(e) {
        e.preventDefault()
        const key = newField.key_name || newField.label.toLowerCase().replace(/\s+/g, '_')
        await supabase.from('bio_config').insert([{ ...newField, key_name: key, urutan: configs.length + 1 }])
        setNewField({ label: '', key_name: '', field_type: 'text', is_required: false })
        fetchConfig()
    }

    return (
        <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-[#box]' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#333' }}>
                Pengaturan Field Biodata (Admin)
            </h3>

            {/* Form Tambah Field Baru */}
            <form
                onSubmit={handleAdd}
                style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
            >
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#4a5568' }}>Tambah Pertanyaan Biodata Baru</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        placeholder="Label Field (misal: Pekerjaan)"
                        value={newField.label}
                        onChange={e => setNewField({ ...newField, label: e.target.value })}
                        required
                        style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e0',
                            fontSize: '0.95rem',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <select
                            value={newField.field_type}
                            onChange={e => setNewField({ ...newField, field_type: e.target.value })}
                            style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e0',
                                fontSize: '0.95rem',
                                flex: '1',
                                minWidth: '130px'
                            }}
                        >
                            <option value="text">Teks</option>
                            <option value="number">Angka</option>
                            <option value="date">Tanggal</option>
                        </select>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                padding: '10px 16px',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                whiteSpace: 'nowrap',
                                flex: '1',
                                minWidth: '130px'
                            }}
                        >
                            + Tambah Field
                        </button>
                    </div>
                </div>
            </form>

            {/* Card List Responsif (Rapi di HP) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#4a5568' }}>Daftar Field Biodata</h4>
                {configs.map(c => (
                    <div
                        key={c.id}
                        style={{
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '14px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#2d3748' }}>
                                {c.label} {c.is_required && <span style={{ color: 'red' }}>*</span>}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '4px' }}>
                                Tipe: <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{c.field_type}</span> |
                                Status: <span style={{ color: c.is_active ? '#2b6cb0' : '#e53e3e', fontWeight: '600' }}>
                                    {c.is_active ? 'Aktif' : 'Disembunyikan'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => toggleActive(c.id, c.is_active)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                border: 'none',
                                backgroundColor: c.is_active ? '#fff5f5' : '#ebf8ff',
                                color: c.is_active ? '#c53030' : '#2b6cb0',
                                border: `1px solid ${c.is_active ? '#feb2b2' : '#bee3f8'}`
                            }}
                        >
                            {c.is_active ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}