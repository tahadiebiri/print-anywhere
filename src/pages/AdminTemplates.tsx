import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getCustomTemplates,
  saveCustomTemplates,
  type TemplateDefinition,
} from '@/lib/template-data';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { TemplateEditor } from '@/components/admin/TemplateEditor';

export default function AdminTemplates() {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    toast.success('Çıkış yapıldı');
    navigate('/');
  };
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_auth') === '1';
  });
  const [customTemplates, setCustomTemplates] = useState<TemplateDefinition[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  useEffect(() => {
    setCustomTemplates(getCustomTemplates());
  }, []);

  const saveAll = (templates: TemplateDefinition[]) => {
    setCustomTemplates(templates);
    saveCustomTemplates(templates);
    toast.success('Kaydedildi');
  };

  const addNew = () => {
    const newTmpl: TemplateDefinition = {
      id: `custom_${Date.now()}`,
      category: 'list',
      name: 'Yeni Şablon',
      description: 'Açıklama ekleyin',
      icon: '📄',
      fields: [{ key: 'title', label: 'Başlık', type: 'text', placeholder: 'Başlık', defaultValue: '' }],
      render: 'todo',
    };
    const updated = [...customTemplates, newTmpl];
    saveAll(updated);
    setEditingIdx(updated.length - 1);
  };

  const deleteTemplate = (idx: number) => {
    const updated = customTemplates.filter((_, i) => i !== idx);
    saveAll(updated);
    setEditingIdx(null);
  };

  const updateTemplate = (idx: number, partial: Partial<TemplateDefinition>) => {
    const updated = [...customTemplates];
    updated[idx] = { ...updated[idx], ...partial };
    setCustomTemplates(updated);
  };

  if (!authenticated) {
    return (
      <AdminLogin onLogin={() => {
        sessionStorage.setItem('admin_auth', '1');
        setAuthenticated(true);
      }} />
    );
  }

  if (editingIdx !== null && customTemplates[editingIdx]) {
    return (
      <TemplateEditor
        template={customTemplates[editingIdx]}
        onUpdate={(partial) => updateTemplate(editingIdx, partial)}
        onSave={() => saveAll(customTemplates)}
        onDelete={() => deleteTemplate(editingIdx)}
        onBack={() => { saveAll(customTemplates); setEditingIdx(null); }}
      />
    );
  }

  return (
    <AdminDashboard
      customTemplates={customTemplates}
      onSaveAll={saveAll}
      onAddNew={addNew}
      onEditTemplate={setEditingIdx}
    />
  );
}
