/**
 * Chapter Selection component for Ether Excel
 * Allows teachers to select from existing chapters or create a new one
 */
import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, ChevronDown, Book, Filter, Bookmark, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { getAllChapters, getUniqueGrades, getChaptersByGrade, getTopicsByChapterId, getQuestionsByTopicId } from '../../services/database';

const ChapterSelection: React.FC = () => {
  const { setView, setCurrentChapter, setTopics, setQuestions } = useAppContext();
  
  const [chapters, setChapters] = useState<any[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);
  const [chapterPreview, setChapterPreview] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [hasChapters, setHasChapters] = useState(true);
  
  // Load all available grades and chapters
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get unique grades
        const gradesData = await getUniqueGrades();
        setGrades(gradesData);
        
        // Load all chapters initially
        const chaptersData = await getAllChapters();
        setChapters(chaptersData);
        setHasChapters(chaptersData.length > 0);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
        setHasChapters(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle grade selection
  const handleGradeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const grade = e.target.value;
    setSelectedGrade(grade);
    setSelectedChapter(null);
    setChapterPreview(null);
    
    if (grade) {
      try {
        setLoading(true);
        const filteredChapters = await getChaptersByGrade(grade);
        setChapters(filteredChapters);
        setLoading(false);
      } catch (error) {
        console.error('Error loading chapters by grade:', error);
        setLoading(false);
      }
    } else {
      // If no grade selected, get all chapters
      try {
        setLoading(true);
        const allChapters = await getAllChapters();
        setChapters(allChapters);
        setLoading(false);
      } catch (error) {
        console.error('Error loading all chapters:', error);
        setLoading(false);
      }
    }
  };
  
  // Handle chapter selection
  const handleChapterSelect = async (chapter: any) => {
    setSelectedChapter(chapter);
    
    try {
      setLoadingPreview(true);
      
      // Load topics for the selected chapter
      const topicsData = await getTopicsByChapterId(chapter.id);
      
      // Load a preview of questions for each topic (for preview only)
      const previewQuestions: Record<string, any[]> = {};
      
      for (const topic of topicsData) {
        const questionData = await getQuestionsByTopicId(topic.id);
        previewQuestions[topic.id] = questionData;
      }
      
      setChapterPreview({
        chapter,
        topics: topicsData,
        questions: previewQuestions
      });
      
      setLoadingPreview(false);
    } catch (error) {
      console.error('Error loading chapter preview:', error);
      setLoadingPreview(false);
    }
  };
  
  // Handle using selected chapter
  const handleUseSelectedChapter = () => {
    if (chapterPreview) {
      // Set the chapter, topics, and questions in the app context
      setCurrentChapter({
        id: chapterPreview.chapter.id,
        title: chapterPreview.chapter.title,
        content: chapterPreview.chapter.content,
        grade: chapterPreview.chapter.grade,
        uploadedAt: new Date(chapterPreview.chapter.created_at),
        status: 'ready'
      });
      
      setTopics(chapterPreview.topics);
      setQuestions(chapterPreview.questions);
      
      // Navigate to review screen
      setView('review');
    }
  };
  
  // Handle creating a new chapter
  const handleNewChapter = () => {
    setView('upload');
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Select Chapter</CardTitle>
          <CardDescription>
            Choose from existing chapters or upload a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {hasChapters ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-[#EEF4FF] p-4 rounded-lg">
                    <h3 className="text-lg font-medium flex items-center">
                      <Filter className="w-5 h-5 mr-2 text-[#3A7AFE]" />
                      Filter Chapters
                    </h3>
                    
                    <div className="mt-3">
                      <label htmlFor="gradeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                        Grade Level
                      </label>
                      <div className="relative">
                        <select
                          id="gradeFilter"
                          value={selectedGrade}
                          onChange={handleGradeChange}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#3A7AFE] focus:border-[#3A7AFE] sm:text-sm rounded-md"
                        >
                          <option value="">All Grades</option>
                          {grades.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-medium flex items-center">
                        <Book className="w-4 h-4 mr-2 text-[#3A7AFE]" />
                        Available Chapters
                      </h3>
                    </div>
                    
                    {loading ? (
                      <div className="p-4 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-2"></div>
                        <p className="text-sm text-gray-500">Loading chapters...</p>
                      </div>
                    ) : chapters.length > 0 ? (
                      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        {chapters.map((chapter) => (
                          <div
                            key={chapter.id}
                            className={`p-3 hover:bg-gray-50 cursor-pointer ${
                              selectedChapter?.id === chapter.id ? 'bg-[#EEF4FF]' : ''
                            }`}
                            onClick={() => handleChapterSelect(chapter)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium">{chapter.title}</h4>
                                <p className="text-xs text-gray-500">
                                  Grade: {chapter.grade} • {new Date(chapter.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              {selectedChapter?.id === chapter.id && (
                                <div className="w-2 h-2 bg-[#3A7AFE] rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No chapters found
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <Button
                      onClick={handleNewChapter}
                      icon={<Upload className="w-4 h-4 mr-2" />}
                      variant="outline"
                      fullWidth
                    >
                      Upload New Chapter
                    </Button>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  {loadingPreview ? (
                    <div className="min-h-[400px] border border-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="inline-block w-8 h-8 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-3"></div>
                        <p className="text-gray-600">Loading chapter preview...</p>
                      </div>
                    </div>
                  ) : chapterPreview ? (
                    <div className="border border-gray-200 rounded-lg">
                      <div className="bg-[#EEF4FF] px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Chapter Preview</h3>
                          <Button
                            onClick={handleUseSelectedChapter}
                            size="sm"
                            icon={<ArrowRight className="w-4 h-4 ml-2" />}
                            iconPosition="right"
                          >
                            Use This Chapter
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                          <h3 className="text-lg font-medium mb-1">{chapterPreview.chapter.title}</h3>
                          <p className="text-sm text-gray-500">
                            Grade: {chapterPreview.chapter.grade} • 
                            {chapterPreview.topics.length} topics • 
                            {Object.values(chapterPreview.questions).reduce((acc: any, val: any) => acc + val.length, 0)} questions
                          </p>
                        </div>
                        
                        <h4 className="text-sm font-medium flex items-center mb-3">
                          <Bookmark className="w-4 h-4 mr-2 text-[#3A7AFE]" />
                          Topics & Questions
                        </h4>
                        
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                          {chapterPreview.topics.map((topic: any) => (
                            <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="bg-gray-50 px-3 py-2">
                                <h5 className="font-medium text-sm">{topic.topic_name}</h5>
                              </div>
                              <div className="p-3">
                                <p className="text-sm text-gray-600 mb-2">{topic.topic_coverage}</p>
                                
                                <div className="bg-[#EEF4FF] p-2 rounded-md mb-3">
                                  <p className="text-xs italic text-gray-600">"{topic.topic_narrative}"</p>
                                </div>
                                
                                <h6 className="text-xs font-medium mb-2">Sample Questions:</h6>
                                <div className="space-y-2">
                                  {(chapterPreview.questions[topic.id] || []).slice(0, 2).map((question: any) => (
                                    <div key={question.id} className="bg-gray-50 p-2 rounded-md text-xs">
                                      <p className="font-medium">{question.question_stem}</p>
                                      <div className="mt-1 pl-2 text-gray-600">
                                        {question.correct_option === 'A' && <span className="text-green-600">✓ </span>}
                                        A: {question.option_a}
                                      </div>
                                      <div className="pl-2 text-gray-600">
                                        {question.correct_option === 'B' && <span className="text-green-600">✓ </span>}
                                        B: {question.option_b}
                                      </div>
                                      {/* Only showing A and B for brevity */}
                                    </div>
                                  ))}
                                  {chapterPreview.questions[topic.id]?.length > 2 && (
                                    <div className="text-xs text-center text-blue-500">
                                      +{chapterPreview.questions[topic.id].length - 2} more questions
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[400px] border border-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center p-8">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Chapter</h3>
                        <p className="text-sm text-gray-500 max-w-md">
                          Choose a chapter from the list to preview its content, topics, and questions
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Chapters Available</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  There are no chapters in the database yet. Start by uploading a new chapter.
                </p>
                <Button
                  onClick={handleNewChapter}
                  icon={<Upload className="w-5 h-5 mr-2" />}
                  size="lg"
                >
                  Upload New Chapter
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div></div>
          {hasChapters && !chapterPreview && (
            <Button onClick={handleNewChapter} icon={<Upload className="w-4 h-4 mr-2" />}>
              Upload New Chapter
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChapterSelection;