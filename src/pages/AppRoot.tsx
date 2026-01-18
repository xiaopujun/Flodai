import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './Home';
import { Editor } from './Editor';

export function AppRoot() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/editor/:projectId" element={<Editor />} />
    </Routes>
  );
}
