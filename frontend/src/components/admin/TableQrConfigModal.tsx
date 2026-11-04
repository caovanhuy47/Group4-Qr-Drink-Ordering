import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/useRestaurant';
import { buildTableQrCodeUrl, buildTableOrderUrl, getPublicBaseUrl } from '../../utils/qrConfig';

interface TableQrConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableQrConfigModal: React.FC<TableQrConfigModalProps> = ({ isOpen, onClose }) => {
  const { tables, addNewTable, showToast } = useRestaurant();
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableArea, setNewTableArea] = useState('Vỉa hè trước quán');
  const [selectedQrTable, setSelectedQrTable] = useState(tables[0] || null);

  if (!isOpen) return null;

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;
    addNewTable(newTableNumber, newTableArea);
    setNewTableNumber('');
  };

  const handlePrint = (tableNumber: string) => {
    showToast(`Đang gửi lệnh in thẻ QR cho ${tableNumber} tới máy in...`, 'info');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-warm-lg border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-surface-container-low p-4 md:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface leading-tight">
                Cấu Hình Bàn & Mã QR
              </h3>
              <p className="text-xs text-on-surface-variant">
                Quản lý mã QR gọi món tại bàn • Chỉ dành cho Quản trị viên
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add Table Form */}
          <div className="bg-surface-container-low/60 rounded-xl p-4 border border-border/60">
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Thêm bàn & sinh mã QR mới</span>
            </h4>
            <form onSubmit={handleAddTable} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1">
                  Số hoặc tên bàn
                </label>
                <input
                  type="text"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="VD: Bàn 30, Bàn VIP 1"
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-border text-xs text-on-surface focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1">
                  Khu vực kê bàn
                </label>
                <select
                  value={newTableArea}
                  onChange={(e) => setNewTableArea(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-border text-xs text-on-surface focus:border-primary outline-none"
                >
                  <option value="Vỉa hè trước quán">Vỉa hè trước quán</option>
                  <option value="Góc phố thoáng mát">Góc phố thoáng mát</option>
                  <option value="Khu vực trong nhà">Khu vực trong nhà</option>
                  <option value="Tầng lửng hè">Tầng lửng hè</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-lg bg-primary-container text-on-primary font-bold text-xs shadow-xs hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Tạo bàn & QR</span>
                </button>
              </div>
            </form>
          </div>

          {/* Tables QR List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-headline font-bold text-sm text-on-surface">
                Danh sách bàn ({tables.length} bàn hiện có)
              </h4>
              <span className="text-xs text-on-surface-variant">
                Bấm vào bàn để xem / in thẻ QR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {tables.map((table) => {
                const isSelected = selectedQrTable?.id === table.id;
                return (
                  <div
                    key={table.id}
                    onClick={() => setSelectedQrTable(table)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-container bg-primary-soft/50 shadow-xs ring-1 ring-primary-container'
                        : 'border-border bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        <span className="material-symbols-outlined text-[20px]">qr_code</span>
                      </div>
                      <div className="min-w-0">
                        <span className="font-headline font-bold text-sm text-on-surface block truncate">
                          {table.number}
                        </span>
                        <span className="text-[11px] text-on-surface-variant block truncate">
                          {table.area}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrint(table.number);
                        }}
                        title="In mã QR dán bàn"
                        className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Table QR Preview */}
          {selectedQrTable && (
            <div className="bg-surface-container-low rounded-xl p-4 border border-border flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-xs border border-border shrink-0 flex items-center justify-center">
                <img
                  src={selectedQrTable.qrCodeUrl || buildTableQrCodeUrl(selectedQrTable.number)}
                  alt={`QR ${selectedQrTable.number}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="font-headline font-extrabold text-base text-primary">
                    {selectedQrTable.number}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                    {selectedQrTable.area}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                    Đích: {getPublicBaseUrl()}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Quét mã QR này bằng camera điện thoại để khách truy cập menu, gọi món trực tiếp vào {selectedQrTable.number}.
                </p>
                <div className="bg-surface-container/70 rounded-md px-2 py-1 text-[11px] font-mono text-primary truncate max-w-full">
                  {buildTableOrderUrl(selectedQrTable.number)}
                </div>
                <div className="pt-1 flex items-center gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => handlePrint(selectedQrTable.number)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">print</span>
                    <span>In tem QR</span>
                  </button>
                  <a
                    href={selectedQrTable.qrCodeUrl || buildTableQrCodeUrl(selectedQrTable.number)}
                    download={`QR_${selectedQrTable.number}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    <span>Tải ảnh</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low/70 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors"
          >
            Đóng cấu hình
          </button>
        </div>
      </div>
    </div>
  );
};
export default TableQrConfigModal;

