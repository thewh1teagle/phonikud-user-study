import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import type { ModelStats } from '../lib/firebase';
import { getAllSubmissions, calculateStats, exportToCSV } from '../lib/firebase';
import { RefreshCcw, Download, Home, MessageSquare, Database } from 'lucide-react';

export default function Results() {
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [uniqueParticipants, setUniqueParticipants] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const submissions = await getAllSubmissions();
      setTotalSubmissions(submissions.length);

      const uniqueEmails = new Set(submissions.map(s => s.email));
      setUniqueParticipants(uniqueEmails.size);

      setStats(calculateStats(submissions));
    } catch (err) {
      console.error('Error loading results:', err);
      setError('שגיאה בטעינת התוצאות');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const csv = await exportToCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `phonikud-study-results-${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading CSV:', err);
      alert('שגיאה בהורדת הקובץ');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl" dir="rtl">טוען תוצאות...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600" dir="rtl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl" dir="rtl">
              תוצאות מחקר הערכת TTS
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-100 rounded-lg text-center">
                <div className="text-3xl font-bold text-slate-900">{uniqueParticipants}</div>
                <div className="text-sm text-slate-600" dir="rtl">משתתפים</div>
              </div>
              <div className="p-4 bg-slate-100 rounded-lg text-center">
                <div className="text-3xl font-bold text-slate-900">{totalSubmissions}</div>
                <div className="text-sm text-slate-600" dir="rtl">השוואות כוללות</div>
              </div>
            </div>

            {/* CMOS Results */}
            {stats ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-200">
                      <th className="border p-3 text-right" dir="rtl">מדד</th>
                      <th className="border p-3 text-center" dir="rtl">ממוצע CMOS</th>
                      <th className="border p-3 text-center" dir="rtl">רווח סמך 95%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-slate-50">
                      <td className="border p-3 font-semibold" dir="rtl">טבעיות</td>
                      <td className="border p-3 text-center">{stats.meanNaturalness.toFixed(2)}</td>
                      <td className="border p-3 text-center">&plusmn;{stats.ciNaturalness.toFixed(2)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="border p-3 font-semibold" dir="rtl">התאמה לטקסט</td>
                      <td className="border p-3 text-center">{stats.meanAccuracy.toFixed(2)}</td>
                      <td className="border p-3 text-center">&plusmn;{stats.ciAccuracy.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-xs text-slate-500 mt-2 text-center" dir="rtl">
                  ציון חיובי = A עדיף, ציון שלילי = B עדיף, 0 = דומה. סולם: -3 עד +3.
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500" dir="rtl">אין נתונים עדיין</div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap justify-between items-center gap-2 pt-4">
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    דף הבית
                  </Link>
                </Button>
                <Button onClick={loadResults} variant="outline">
                  <RefreshCcw className="h-4 w-4" />
                  רענן
                </Button>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <a href="https://console.firebase.google.com/u/0/project/phonikud-user-study" target="_blank" rel="noopener noreferrer">
                    <Database className="h-4 w-4" />
                    ניהול מסד נתונים
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/feedbacks">
                    <MessageSquare className="h-4 w-4" />
                    הערות משתתפים
                  </Link>
                </Button>
                <Button onClick={handleDownloadCSV}>
                  <Download className="h-4 w-4" />
                  הורד CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
