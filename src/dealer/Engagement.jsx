import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Download, Upload, CheckCircle, XCircle, AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';
import { getAllUsernames, uploadEngagements, getEngagementsSummary } from '../../api/client';

export default function Engagement() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [existingUsernames, setExistingUsernames] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);

  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    fetchUsernames();
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await getEngagementsSummary();
      if (res.status === 'success') {
        setSummaryData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch summary", error);
    }
  };

  const fetchUsernames = async () => {
    setLoading(true);
    try {
      const res = await getAllUsernames();
      if (res.status === 'success') {
        const usernames = new Set(res.data.map(d => String(d.username).toLowerCase()));
        setExistingUsernames(usernames);
      }
    } catch (error) {
      console.error("Failed to fetch usernames", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Username: "user123", Status: "engage" },
      { Username: "user456", Status: "not engage" }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Engagement.xlsx");
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const parsedData = data.map(row => {
        // Handle case sensitivity in excel headers
        const username = row['Username'] || row['username'] || '';
        const status = row['Status'] || row['status'] || '';

        return {
          username: String(username).trim(),
          status: String(status).trim(),
          isValid: existingUsernames.has(String(username).trim().toLowerCase())
        };
      }).filter(row => row.username !== '');

      setPreviewData(parsedData);
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleUpload = async () => {
    if (previewData.length === 0) return;

    setUploading(true);
    try {
      // Send only valid ones, or send all and let backend double check
      const dataToUpload = previewData.map(d => ({
        username: d.username,
        status: d.status
      }));

      const res = await uploadEngagements({ data: dataToUpload, date: uploadDate });
      if (res.status === 'success') {
        setResult({
          success: res.success_count,
          notFoundCount: res.not_found_count,
          notFoundUsernames: res.not_found_usernames
        });
        setPreviewData([]);
        setFile(null);
        fetchSummary();
      } else {
        alert("Upload gagal: " + res.message);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat upload data.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Upload Data Engagement</h2>
        <p className="text-slate-500 text-sm">
          Gunakan fitur ini untuk mengunggah riwayat engagement konsumen setiap bulan.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadTemplate}
            className="flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Template Excel
          </button>

          <label className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            Pilih File Excel
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {file && (
          <div className="text-sm text-slate-600">
            File terpilih: <span className="font-medium">{file.name}</span>
          </div>
        )}

        {/* Result Message */}
        {result && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
            <h3 className="text-emerald-800 font-bold mb-2 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Upload Selesai
            </h3>
            <p className="text-emerald-700 text-sm mb-1">Berhasil disimpan: <strong>{result.success}</strong> data.</p>
            {result.notFoundCount > 0 && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-100">
                <p className="text-rose-600 text-sm font-medium flex items-center mb-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {result.notFoundCount} Username tidak terdeteksi (Customer ID tidak ditemukan):
                </p>
                <div className="text-sm text-slate-600 max-h-32 overflow-y-auto">
                  <ul className="list-disc pl-5">
                    {result.notFoundUsernames.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {previewData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Review Data ({previewData.length} baris)</h3>
              <div className="flex items-center gap-4">
                <input 
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                  {uploading ? 'Mengupload...' : 'Mulai Upload'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.slice(0, 100).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-3">{idx + 1}</td>
                      <td className="px-6 py-3 font-medium text-slate-900">{row.username}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status.toLowerCase() === 'engage' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {row.isValid ? (
                          <span className="flex items-center text-emerald-600 text-xs font-medium">
                            <CheckCircle className="w-4 h-4 mr-1" /> Ditemukan
                          </span>
                        ) : (
                          <span className="flex items-center text-rose-600 text-xs font-medium">
                            <XCircle className="w-4 h-4 mr-1" /> Tidak Ditemukan
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {previewData.length > 100 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-slate-500 italic">
                        Menampilkan 100 dari {previewData.length} baris...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center text-emerald-600 font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                {previewData.filter(d => d.isValid).length} Username Valid
              </div>
              <div className="flex items-center text-rose-600 font-medium">
                <XCircle className="w-4 h-4 mr-1" />
                {previewData.filter(d => !d.isValid).length} Username Tidak Valid
              </div>
            </div>
          </div>
        )}

        {/* Summary Table */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-lg">Ringkasan Status Konsumen</h3>
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-bold">
              {summaryData.length} Konsumen
            </span>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Kontak</th>
                  <th className="px-6 py-4">Status Engagement</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summaryData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Belum ada data konsumen</td>
                  </tr>
                ) : (
                  summaryData.map(c => {
                    const isEngage = c.latest_status && c.latest_status.toLowerCase() === 'engage';
                    const isNotEngage = c.latest_status && c.latest_status.toLowerCase() !== 'engage';

                    const message = `Selamat Siang Bapak/Ibu ${c.nama} ${c.company},\n\nKami dari *Mitsubishi Fuso Bintaro* ingin mengingatkan Anda untuk membuka akun *GPS Runner* Anda secara rutin.\n\nDengan memastikan *GPS pada kendaraan* Bapak/Ibu selalu dalam keadaan terupdate, Anda bisa menjaga agar tidak ada masalah yang muncul.\n\nIngat, *${c.vehicle_count} kendaraan* Bapak/Ibu adalah aset yang sangat berharga!\nJika ada kendaraan Anda **Not Update / Tidak Aktif* kami bisa membantu Anda.\n\nAnda bisa Login menggunakan Username : *${c.username}*\n\nJika Anda mengalami kesulitan dalam mengakses aplikasi atau lupa password, jangan ragu untuk menghubungi kami. *Kami siap membantu Anda!*\n\nInfo selengkapnya\nhttps://www.ktbfuso.co.id/service/telematics/\n\nSalam hangat,\n*Mitsubishi Fuso Bintaro*`;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/dealer/customers/${c.id}`)}
                            className="text-left group"
                          >
                            <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{c.username}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{c.company}</div>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{c.nama}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{c.telp}</div>
                        </td>
                        <td className="px-6 py-4">
                          {c.latest_status ? (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isEngage ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                              {c.latest_status}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Belum ada data</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {c.status && c.status.toLowerCase() === 'unconnected' ? (
                            <span className="text-xs text-rose-600 font-medium flex items-center">
                              <AlertCircle className="w-3.5 h-3.5 mr-1" />
                              Unconnected
                            </span>
                          ) : (isNotEngage || !c.latest_status) && c.telp ? (
                            <a
                              href={`https://wa.me/62${c.telp}?text=${encodeURIComponent(message)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                              Follow Up WA
                            </a>
                          ) : isEngage ? (
                            <span className="text-xs text-emerald-600 font-medium flex items-center">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Engage
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
