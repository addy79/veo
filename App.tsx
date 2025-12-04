import React, { useState, useEffect, useRef } from 'react';
import { Video, Image as ImageIcon, Sparkles, Loader2, Upload, AlertCircle, Key } from 'lucide-react';
import { geminiService } from './services/geminiService';
import { VIDEO_STYLES } from './constants';
import { GeneratedVideo, GenerationType, AspectRatio, Resolution } from './types';
import { VideoCard } from './components/VideoCard';
import { StatsDashboard } from './components/StatsDashboard';

const App = () => {
  // State
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [activeTab, setActiveTab] = useState<GenerationType>(GenerationType.TEXT_TO_VIDEO);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(VIDEO_STYLES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize
  useEffect(() => {
    const checkKey = async () => {
      const ready = await geminiService.checkApiKey();
      setApiKeyReady(ready);
    };
    checkKey();
    
    // Load history
    const saved = localStorage.getItem('veo_history');
    if (saved) {
      try {
        setGeneratedVideos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem('veo_history', JSON.stringify(generatedVideos));
  }, [generatedVideos]);

  const handleApiKeySelect = async () => {
    try {
      await geminiService.openApiKeyDialog();
      // Assume success as per instructions
      setApiKeyReady(true);
      setError(null);
    } catch (e) {
      setError("Failed to select API Key. Please try again.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!apiKeyReady) {
      await handleApiKeySelect();
      return;
    }

    if (activeTab === GenerationType.TEXT_TO_VIDEO && !prompt.trim()) {
      setError("Please enter a text prompt.");
      return;
    }
    if (activeTab === GenerationType.IMAGE_TO_VIDEO && !uploadedImage) {
      setError("Please upload an image.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const styleConfig = VIDEO_STYLES.find(s => s.id === selectedStyle);
      const fullPrompt = styleConfig 
        ? `${prompt}. Style: ${styleConfig.promptModifier}`
        : prompt;

      let videoUrl = '';
      
      if (activeTab === GenerationType.TEXT_TO_VIDEO) {
        videoUrl = await geminiService.generateVideoFromText(fullPrompt);
      } else {
        if (!uploadedImage) throw new Error("Image missing");
        videoUrl = await geminiService.generateVideoFromImage(uploadedImage, fullPrompt);
      }

      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        url: videoUrl,
        prompt: prompt,
        style: selectedStyle,
        createdAt: Date.now(),
        type: activeTab,
        aspectRatio: '16:9',
        resolution: '720p'
      };

      setGeneratedVideos(prev => [newVideo, ...prev]);

    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found")) {
         setApiKeyReady(false);
         setError("API Key invalid or expired. Please select a project again.");
      } else {
         setError(err.message || "Something went wrong during generation.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `veo-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Video className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Veo Studio
            </span>
          </div>
          
          <div className="flex items-center gap-4">
             {!apiKeyReady ? (
                <button 
                  onClick={handleApiKeySelect}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 border border-yellow-600/50 rounded-full text-sm font-medium transition-all"
                >
                  <Key size={16} />
                  Select API Key
                </button>
             ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium border border-green-500/20">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Veo Connected
                </div>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Generator Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
              
              {/* Tabs */}
              <div className="flex bg-gray-800 p-1 rounded-lg mb-6">
                <button
                  onClick={() => setActiveTab(GenerationType.TEXT_TO_VIDEO)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                    activeTab === GenerationType.TEXT_TO_VIDEO 
                      ? 'bg-gray-700 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Sparkles size={16} />
                  Text to Video
                </button>
                <button
                  onClick={() => setActiveTab(GenerationType.IMAGE_TO_VIDEO)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                    activeTab === GenerationType.IMAGE_TO_VIDEO 
                      ? 'bg-gray-700 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <ImageIcon size={16} />
                  Image to Video
                </button>
              </div>

              {/* Form Content */}
              <div className="space-y-6">
                
                {activeTab === GenerationType.IMAGE_TO_VIDEO && (
                   <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer group ${
                      uploadedImage ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'
                    }`}
                   >
                     <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      {uploadedImage ? (
                        <div className="relative rounded-lg overflow-hidden h-40 w-full">
                          <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-medium">Click to change</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-400 group-hover:scale-110 transition-transform">
                            <Upload size={20} />
                          </div>
                          <p className="text-sm font-medium text-gray-300">Click to upload image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                   </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {activeTab === GenerationType.TEXT_TO_VIDEO ? 'Describe your video' : 'Additional prompt (Optional)'}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={activeTab === GenerationType.TEXT_TO_VIDEO ? "A neon hologram of a cat driving a cyberpunk car..." : "Make the water flow and clouds move..."}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {VIDEO_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                          selectedStyle === style.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all ${
                    isGenerating 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transform hover:scale-[1.02]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="fill-current" />
                      Generate Video
                    </>
                  )}
                </button>
                
                {!apiKeyReady && (
                  <p className="text-xs text-center text-yellow-500/80">
                    *Requires API Key selection
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Gallery & History */}
          <div className="lg:col-span-8">
            <StatsDashboard videos={generatedVideos} />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Creations</h2>
              <span className="text-sm text-gray-500">{generatedVideos.length} videos</span>
            </div>

            {generatedVideos.length === 0 ? (
              <div className="bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-2xl p-12 text-center">
                <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                  <Video size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No videos yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Select a style, type a prompt, and watch AI transform your ideas into reality.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedVideos.map((video) => (
                  <VideoCard 
                    key={video.id} 
                    video={video} 
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
