import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import type { CommentSubmission } from '../lib/firebase';
import { getAllComments } from '../lib/firebase';

export default function Feedbacks() {
  const [comments, setComments] = useState<CommentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await getAllComments();
      const sorted = [...results].sort((a, b) => {
        const aTime = (a.timestamp as { toDate?: () => Date } | undefined)?.toDate?.()?.getTime() ?? 0;
        const bTime = (b.timestamp as { toDate?: () => Date } | undefined)?.toDate?.()?.getTime() ?? 0;
        return bTime - aTime;
      });
      setComments(sorted);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('שגיאה בטעינת המשובים');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl" dir="rtl">טוען משובים...</div>
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
              משובים מהמשתתפים
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <Button onClick={loadComments} variant="outline">
                🔄 רענן
              </Button>
              <Button asChild variant="secondary">
                <Link to="/results">חזרה לתוצאות</Link>
              </Button>
            </div>

            {comments.length === 0 ? (
              <div className="text-center text-slate-600" dir="rtl">
                אין משובים עדיין
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, index) => {
                  const timestamp = (comment.timestamp as { toDate?: () => Date } | undefined)?.toDate?.();
                  return (
                    <div key={`${comment.email}-${index}`} className="bg-white border rounded-lg p-4 space-y-2">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="font-semibold">{comment.name}</div>
                        <div className="text-sm text-slate-500">{comment.email}</div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {timestamp ? timestamp.toLocaleString('he-IL') : ''}
                      </div>
                      <div className="text-slate-900 whitespace-pre-wrap" dir="rtl">
                        {comment.comments}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
