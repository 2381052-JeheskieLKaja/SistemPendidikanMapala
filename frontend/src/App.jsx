import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout, PengurusLayout, SiswaLayout } from './layouts/RoleLayout'
import PublikLayout from './layouts/PublikLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRedirect from './routes/RoleRedirect'
import Login from './pages/auth/Login'
import InfoPublik from './pages/publik/InfoPublik'
import NotFound from './pages/NotFound'
import DashboardPengelola from './pages/shared/DashboardPengelola'
import MateriKelola from './pages/shared/MateriKelola'
import Profil from './pages/shared/Profil'
import ProgramKelolaLayout from './pages/shared/ProgramKelolaLayout'
import DataAnggota from './pages/admin/DataAnggota'
import ProgramPendidikan from './pages/admin/ProgramPendidikan'
import Kurikulum from './pages/admin/Kurikulum'
import Peserta from './pages/admin/Peserta'
import Laporan from './pages/admin/Laporan'
import ProgramList from './pages/pengurus/ProgramList'
import Jadwal from './pages/pengurus/Jadwal'
import Absensi from './pages/pengurus/Absensi'
import Evaluasi from './pages/pengurus/Evaluasi'
import SiswaDashboard from './pages/siswa/Dashboard'
import SiswaMateri from './pages/siswa/Materi'
import SiswaJadwal from './pages/siswa/Jadwal'
import RiwayatAbsensi from './pages/siswa/RiwayatAbsensi'
import Progres from './pages/siswa/Progres'

// Tombol Kelola Admin hanya ke Kurikulum, Materi, Peserta (K5). Pengurus: Materi, Jadwal, Absensi, Evaluasi.
const TAB_ADMIN = [{ to: 'kurikulum', label: 'Kurikulum' }, { to: 'materi', label: 'Materi' }, { to: 'peserta', label: 'Peserta' }]
const TAB_PENGURUS = [
  { to: 'materi', label: 'Materi' }, { to: 'jadwal', label: 'Jadwal' },
  { to: 'absensi', label: 'Absensi' }, { to: 'evaluasi', label: 'Evaluasi' },
]

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<RoleRedirect />} />
      <Route element={<PublikLayout />}>
        <Route path="/publik" element={<InfoPublik />} />
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPengelola />} />
          <Route path="anggota" element={<DataAnggota />} />
          <Route path="program" element={<ProgramPendidikan />} />
          <Route path="program/:id" element={<ProgramKelolaLayout tabs={TAB_ADMIN} backTo="/admin/program" />}>
            <Route index element={<Navigate to="kurikulum" replace />} />
            <Route path="kurikulum" element={<Kurikulum />} />
            <Route path="materi" element={<MateriKelola />} />
            <Route path="peserta" element={<Peserta />} />
          </Route>
          <Route path="laporan" element={<Laporan />} />
          <Route path="profil" element={<Profil />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['pengurus']} />}>
        <Route path="/pengurus" element={<PengurusLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPengelola />} />
          <Route path="program" element={<ProgramList />} />
          <Route path="program/:id" element={<ProgramKelolaLayout tabs={TAB_PENGURUS} backTo="/pengurus/program" />}>
            <Route index element={<Navigate to="materi" replace />} />
            <Route path="materi" element={<MateriKelola />} />
            <Route path="jadwal" element={<Jadwal />} />
            <Route path="absensi" element={<Absensi />} />
            <Route path="evaluasi" element={<Evaluasi />} />
          </Route>
          <Route path="profil" element={<Profil />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['siswa']} />}>
        <Route path="/siswa" element={<SiswaLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SiswaDashboard />} />
          <Route path="materi" element={<SiswaMateri />} />
          <Route path="jadwal" element={<SiswaJadwal />} />
          <Route path="absensi" element={<RiwayatAbsensi />} />
          <Route path="progres" element={<Progres />} />
          <Route path="profil" element={<Profil />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
