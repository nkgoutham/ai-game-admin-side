/**
 * Chapter Upload component for Ether Excel
 */
import React, { useRef, useState } from 'react';
import { FilePlus, Upload, FileText, X } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { extractTextFromPDF } from '../../lib/pdf-parser';

const ChapterUpload: React.FC = () => {
  const { uploadState, setUploadState, setView, setCurrentChapter } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('');
  const [pdfProcessing, setPdfProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState({
      ...uploadState,
      status: 'uploading',
      file,
    });

    if (file.type === 'application/pdf') {
      try {
        setPdfProcessing(true);
        // Extract text from PDF
        const pdfText = await extractTextFromPDF(file);
        setPdfProcessing(false);
        
        setUploadState({
          status: 'preview_ready',
          file,
          content: pdfText,
        });
      } catch (error) {
        console.error('Error processing PDF:', error);
        setPdfProcessing(false);
        setUploadState({
          ...uploadState,
          status: 'initial',
          error: 'Failed to read PDF file. Please try again or paste content directly.',
        });
      }
    } else {
      // Handle text file
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadState({
            status: 'preview_ready',
            file,
            content: event.target.result as string,
          });
        }
      };
      reader.onerror = () => {
        setUploadState({
          ...uploadState,
          status: 'initial',
          error: 'Failed to read file.',
        });
      };
      reader.readAsText(file);
    }
  };

  const handlePasteContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUploadState({
      status: 'preview_ready',
      content: e.target.value,
    });
  };

  const handleConfirm = () => {
    if (!title.trim()) {
      alert('Please enter a chapter title');
      return;
    }
    
    if (!grade.trim()) {
      alert('Please enter a grade level');
      return;
    }

    if (!uploadState.content?.trim()) {
      alert('Please upload or paste chapter content');
      return;
    }

    // Create a chapter object
    const newChapter = {
      id: Date.now().toString(),
      title,
      content: uploadState.content || '',
      grade,
      uploadedAt: new Date(),
      status: 'uploaded' as const,
      file: uploadState.file
    };

    setCurrentChapter(newChapter);
    setUploadState({ ...uploadState, status: 'confirmed' });
    setView('processing');
  };

  const handleReset = () => {
    setUploadState({ status: 'initial' });
    setTitle('');
    setGrade('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Chapter Content</CardTitle>
          <CardDescription>
            Upload a textbook chapter as PDF or paste the content directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadState.status === 'initial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.txt"
                    className="hidden"
                  />
                  <FilePlus className="w-12 h-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Upload a file</h3>
                  <p className="mt-1 text-xs text-gray-500">PDF or TXT up to 10MB</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    icon={<Upload className="w-4 h-4" />}
                  >
                    Browse Files
                  </Button>
                </div>

                {/* Text paste */}
                <div className="border-2 border-gray-300 rounded-lg p-6">
                  <FileText className="w-8 h-8 text-gray-400 mb-2" />
                  <h3 className="text-sm font-medium text-gray-900">Paste Content</h3>
                  <textarea
                    className="w-full h-32 mt-2 p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste your chapter text here..."
                    onChange={handlePasteContent}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {uploadState.status === 'uploading' && pdfProcessing && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#3A7AFE] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Processing PDF file...</p>
            </div>
          )}

          {uploadState.status === 'preview_ready' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Chapter Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  icon={<X className="w-4 h-4" />}
                >
                  Start Over
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label htmlFor="chapterTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Chapter Title
                    </label>
                    <input
                      type="text"
                      id="chapterTitle"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter chapter title"
                    />
                  </div>

                  <div>
                    <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-1">
                      Grade Level
                    </label>
                    <select
                      id="gradeLevel"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select grade</option>
                      <option value="K">Kindergarten</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={`${i + 1}`}>
                          Grade {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Preview</label>
                  <div className="border border-gray-300 rounded-md p-3 h-32 overflow-y-auto bg-gray-50">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {uploadState.content
                        ? uploadState.content.substring(0, 500) + (uploadState.content.length > 500 ? '...' : '')
                        : 'No content preview available'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
                <Button onClick={handleConfirm}>
                  Confirm & Continue
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChapterUpload;