import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { DayListPage } from "./pages/DayListPage";
import { DayWordsPage } from "./pages/DayWordsPage";
import { WordDetailPage } from "./pages/WordDetailPage";
import { WordNewPage } from "./pages/WordNewPage";
import { WordEditPage } from "./pages/WordEditPage";
import { StudyPage } from "./pages/StudyPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<DayListPage />} />
            <Route path="/days/:day" element={<DayWordsPage />} />
            <Route path="/words/new" element={<WordNewPage />} />
            <Route path="/words/:id" element={<WordDetailPage />} />
            <Route path="/words/:id/edit" element={<WordEditPage />} />
            <Route path="/study" element={<StudyPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
