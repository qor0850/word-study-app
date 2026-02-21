import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { StudyContext } from "./contexts/StudyContext";
import { DayListPage } from "./pages/DayListPage";
import { DayWordsPage } from "./pages/DayWordsPage";
import { WordDetailPage } from "./pages/WordDetailPage";
import { WordNewPage } from "./pages/WordNewPage";
import { WordEditPage } from "./pages/WordEditPage";
import { StudyPage } from "./pages/StudyPage";
import { PersonalListPage } from "./pages/PersonalListPage";

function ToeicLayout() {
  return (
    <StudyContext.Provider value={{ userId: 0, basePath: "/toeic" }}>
      <Routes>
        <Route index element={<DayListPage />} />
        <Route path="days/:day" element={<DayWordsPage />} />
        <Route path="words/new" element={<WordNewPage />} />
        <Route path="words/:id" element={<WordDetailPage />} />
        <Route path="words/:id/edit" element={<WordEditPage />} />
        <Route path="study" element={<StudyPage />} />
      </Routes>
    </StudyContext.Provider>
  );
}

function PersonalLayout() {
  const { userId: uidStr } = useParams<{ userId: string }>();
  const uid = Math.min(Math.max(parseInt(uidStr ?? "0") || 0, 1), 10);
  return (
    <StudyContext.Provider value={{ userId: uid, basePath: `/personal/${uid}` }}>
      <Routes>
        <Route index element={<DayListPage />} />
        <Route path="days/:day" element={<DayWordsPage />} />
        <Route path="words/new" element={<WordNewPage />} />
        <Route path="words/:id" element={<WordDetailPage />} />
        <Route path="words/:id/edit" element={<WordEditPage />} />
        <Route path="study" element={<StudyPage />} />
      </Routes>
    </StudyContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/personal" replace />} />
            <Route path="/toeic/*" element={<ToeicLayout />} />
            <Route path="/personal" element={<PersonalListPage />} />
            <Route path="/personal/:userId/*" element={<PersonalLayout />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
