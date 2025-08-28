import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target, Award } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { levelService } from '../../services/levelService';
import { Level } from '../../types';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Textarea from '../../components/UI/Textarea';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const LevelManagement: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState({
    nama_level: '',
    min_poin: '',
    max_poin: '',
    deskripsi: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      const response = await levelService.getAll();
      if (response.success && response.data) {
        setLevels(response.data.sort((a, b) => a.min_poin - b.min_poin));
      }
    } catch (error) {
      showNotification('error', 'Gagal memuat data level');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_level.trim() || !formData.min_poin || !formData.max_poin) {
      showNotification('error', 'Nama level, min poin, dan max poin harus diisi');
      return;
    }

    const minPoin = parseInt(formData.min_poin);
    const maxPoin = parseInt(formData.max_poin);

    if (minPoin < 0 || maxPoin < -1 || (maxPoin !== -1 && maxPoin < minPoin)) {
      showNotification('error', 'Range poin tidak valid');
      return;
    }

    // Check for overlapping ranges
    const otherLevels = levels.filter(l => editingLevel ? l.id !== editingLevel.id : true);
    const hasOverlap = otherLevels.some(level => {
      if (maxPoin === -1) return false; // Unlimited max
      if (level.max_poin === -1) return minPoin <= level.min_poin;
      return !(maxPoin < level.min_poin || minPoin > level.max_poin);
    });

    if (hasOverlap) {
      showNotification('error', 'Range poin tidak boleh tumpang tindih dengan level lain');
      return;
    }

    setSubmitLoading(true);
    try {
      const levelData = {
        nama_level: formData.nama_level,
        min_poin: minPoin,
        max_poin: maxPoin,
        deskripsi: formData.deskripsi || undefined
      };

      let response;
      if (editingLevel) {
        response = await levelService.update(editingLevel.id, levelData);
      } else {
        response = await levelService.create(levelData);
      }

      if (response.success) {
        showNotification('success', `Level berhasil ${editingLevel ? 'diperbarui' : 'ditambahkan'}`);
        setShowModal(false);
        setEditingLevel(null);
        setFormData({ nama_level: '', min_poin: '', max_poin: '', deskripsi: '' });
        loadLevels();
      } else {
        showNotification('error', response.message || 'Gagal menyimpan level');
      }
    } catch (error) {
      showNotification('error', 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (level: Level) => {
    setEditingLevel(level);
    setFormData({
      nama_level: level.nama_level,
      min_poin: level.min_poin.toString(),
      max_poin: level.max_poin.toString(),
      deskripsi: level.deskripsi || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (level: Level) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus level "${level.nama_level}"?`)) {
      return;
    }

    try {
      const response = await levelService.delete(level.id);
      if (response.success) {
        showNotification('success', 'Level berhasil dihapus');
        loadLevels();
      } else {
        showNotification('error', response.message || 'Gagal menghapus level');
      }
    } catch (error) {
      showNotification('error', 'Terjadi kesalahan saat menghapus');
    }
  };

  const openAddModal = () => {
    setEditingLevel(null);
    setFormData({ nama_level: '', min_poin: '', max_poin: '', deskripsi: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Level & Target Poin</h1>
          <p className="text-gray-600">Atur sistem level dan target pencapaian poin siswa</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Level
        </Button>
      </div>

      <Card>
        {levels.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">Belum ada level yang dibuat</p>
            <p className="text-sm text-gray-400">Buat level pertama untuk sistem poin</p>
          </div>
        ) : (
          <div className="space-y-4">
            {levels.map((level, index) => (
              <div 
                key={level.id} 
                className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        Lv.{index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{level.nama_level}</h4>
                      <p className="text-sm text-gray-600">
                        {level.min_poin} - {level.max_poin === -1 ? '∞' : level.max_poin} poin
                      </p>
                      {level.deskripsi && (
                        <p className="text-sm text-gray-500 mt-1">{level.deskripsi}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(level)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(level)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingLevel ? 'Edit Level' : 'Tambah Level Baru'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Level"
            value={formData.nama_level}
            onChange={(e) => setFormData({ ...formData, nama_level: e.target.value })}
            placeholder="Contoh: Level 1"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Poin Minimum"
              type="number"
              value={formData.min_poin}
              onChange={(e) => setFormData({ ...formData, min_poin: e.target.value })}
              placeholder="0"
              min="0"
              required
            />
            <Input
              label="Poin Maksimum"
              type="number"
              value={formData.max_poin}
              onChange={(e) => setFormData({ ...formData, max_poin: e.target.value })}
              placeholder="99 (atau -1 untuk unlimited)"
              helper="Gunakan -1 untuk unlimited"
              required
            />
          </div>

          <Textarea
            label="Deskripsi (Opsional)"
            value={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            placeholder="Deskripsi pencapaian level ini..."
            rows={3}
          />
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={submitLoading}
              className="flex-1"
            >
              {editingLevel ? 'Perbarui' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LevelManagement;