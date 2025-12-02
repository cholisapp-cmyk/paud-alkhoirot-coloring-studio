import React, { useState, useEffect } from 'react';
import { generateColoringPage } from './services/geminiService';
import { GeneratedImage, Category } from './types';
import { Icons } from './components/Icons';
import { CategoryButton } from './components/CategoryButton';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('coloring_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history when it updates
  useEffect(() => {
    localStorage.setItem('coloring_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt && !selectedCategory) return;
    
    // Construct the actual prompt based on selection or text
    let promptText = prompt;
    if (selectedCategory && !prompt) {
       // If only category is selected, add a generic prompt or rely on user to be more specific?
       // Let's make it work even if they just click "Animals" -> "Random Animal" logic could be applied, 
       // but for now let's assume if they click category, they might want to type something specific or we suggest.
       // Better UX: Category acts as a prompt prefix or helper.
       // Let's stick to: Text Input is Primary. Category sets a theme.
       promptText = `A ${selectedCategory} picture`; 
       if(selectedCategory === Category.ISLAMIC) promptText = "Mosque or Islamic geometric pattern or Arabic calligraphy suitable for kids";
       if(selectedCategory === Category.ANIMALS) promptText = "A cute animal";
    } else if (selectedCategory && prompt) {
        promptText = `${prompt} (${selectedCategory})`;
    }

    if (!promptText) {
        setError("Mohon tuliskan apa yang ingin digambar (contoh: Kucing, Masjid, Apel)");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const dataUrl = await generateColoringPage(promptText);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        dataUrl,
        prompt: promptText,
        timestamp: Date.now()
      };
      
      setGeneratedImage(newImage);
      setHistory(prev => [newImage, ...prev].slice(0, 10)); // Keep last 10
      setPrompt(''); // Clear input for next
    } catch (err: any) {
      setError(err.message || "Gagal membuat gambar. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage.dataUrl;
    link.download = `alkhoirot-coloring-${generatedImage.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectHistoryItem = (item: GeneratedImage) => {
    setGeneratedImage(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    { id: Category.ANIMALS, icon: <Icons.Cat size={32} />, color: 'ring-brand-blue text-brand-blue' },
    { id: Category.FRUITS, icon: <Icons.Apple size={32} />, color: 'ring-brand-red text-brand-red' },
    { id: Category.ISLAMIC, icon: <Icons.Islamic size={32} />, color: 'ring-brand-green text-brand-green' },
    { id: Category.VEHICLES, icon: <Icons.Car size={32} />, color: 'ring-brand-yellow text-brand-yellow' },
    { id: Category.NATURE, icon: <Icons.Nature size={32} />, color: 'ring-brand-purple text-brand-purple' },
    { id: Category.NUMBERS, icon: <Icons.Letters size={32} />, color: 'ring-slate-400 text-slate-500' },
  ];

  const handleCategoryClick = (cat: Category) => {
    if (selectedCategory === cat) {
        setSelectedCategory(null);
    } else {
        setSelectedCategory(cat);
        // Pre-fill some text based on category to help user
        if (!prompt) {
            // Optional: Auto-fill helper text
        }
    }
  };

  return (
    <div className="min-h-screen pb-20">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 no-print">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white">
                    <Icons.Palette size={24} />
                </div>
                <div>
                    <h1 className="font-display font-bold text-2xl text-slate-800 leading-tight">PAUD Al-Khoirot</h1>
                    <p className="text-xs font-semibold text-slate-400 tracking-wide">COLORING STUDIO</p>
                </div>
            </div>
            <button 
                onClick={() => setHistory([])}
                className="text-xs text-slate-400 hover:text-brand-red font-semibold"
            >
                Hapus Riwayat
            </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Generator Section */}
        <section className="space-y-6 no-print">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-bold text-slate-700">Ayo Buat Gambar!</h2>
                <p className="text-slate-500">Pilih kategori atau tulis apa yang ingin kamu warnai.</p>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {categories.map((cat) => (
                    <CategoryButton
                        key={cat.id}
                        label={cat.id}
                        icon={cat.icon}
                        selected={selectedCategory === cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        colorClass={cat.color}
                    />
                ))}
            </div>

            {/* Input Area */}
            <div className="bg-white p-2 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-2 border-2 border-blue-100 focus-within:border-brand-blue transition-colors">
                <input 
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={selectedCategory ? `Contoh: ${selectedCategory === Category.ANIMALS ? 'Kucing lucu' : selectedCategory === Category.ISLAMIC ? 'Masjid indah' : 'Gambar...'}` : "Ketik disini, misal: Kupu-kupu, Masjid, Mobil Balap..."}
                    className="flex-1 p-4 rounded-xl outline-none text-lg font-medium text-slate-700 placeholder:text-slate-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                    onClick={handleGenerate}
                    disabled={loading || (!prompt && !selectedCategory)}
                    className={`
                        px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 min-w-[160px]
                        ${loading || (!prompt && !selectedCategory) 
                            ? 'bg-slate-300 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-brand-blue to-blue-600 hover:scale-105 active:scale-95'
                        }
                    `}
                >
                    {loading ? (
                        <>
                            <Icons.Refresh className="animate-spin" />
                            <span>Membuat...</span>
                        </>
                    ) : (
                        <>
                            <Icons.Sparkles />
                            <span>Buat Ajaib</span>
                        </>
                    )}
                </button>
            </div>
            
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-medium animate-pulse">
                    {error}
                </div>
            )}
        </section>

        {/* Preview & Result Section */}
        {generatedImage && (
            <section className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-white ring-1 ring-slate-100">
                <div className="p-1 bg-slate-50 flex justify-between items-center border-b px-6 py-4 no-print">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Icons.Image size={18} className="text-brand-blue"/>
                        Hasil Gambar
                    </h3>
                    <div className="flex gap-2">
                         <button 
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-brand-blue font-bold hover:bg-blue-100 transition"
                        >
                            <Icons.Download size={18} />
                            <span className="hidden sm:inline">Simpan</span>
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-green text-white font-bold hover:bg-green-600 shadow-md transition transform hover:-translate-y-0.5"
                        >
                            <Icons.Print size={18} />
                            <span>Cetak (Print)</span>
                        </button>
                    </div>
                </div>
                
                {/* Image Container - Simulated A4 Paper */}
                <div className="relative aspect-[1/1.414] w-full bg-white shadow-inner overflow-hidden group">
                     {/* 
                       printable-area: This div represents the actual paper content.
                       Padding is used to simulate margins. In print mode, @media print handles the page size.
                     */}
                    <div id="printable-area" className="w-full h-full flex flex-col bg-white p-8 sm:p-12">
                        
                        {/* Worksheet Header */}
                        <div className="border-b-4 border-slate-800 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                            <div>
                                <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-800 tracking-tight uppercase">PAUD Al-Khoirot</h1>
                                <div className="flex items-center gap-2 mt-2 text-slate-500 font-semibold">
                                     <span className="bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded text-sm uppercase tracking-wide">Lembar Mewarnai</span>
                                </div>
                            </div>
                            
                            {/* Student Details Fields */}
                            <div className="flex flex-col gap-3 w-full sm:w-1/3 min-w-[200px]">
                                 <div className="flex items-end gap-3">
                                    <span className="font-bold text-slate-700 font-sans text-lg">Nama:</span>
                                    <div className="flex-1 border-b-2 border-slate-300 border-dotted h-6"></div>
                                 </div>
                                 <div className="flex items-end gap-3">
                                    <span className="font-bold text-slate-700 font-sans text-lg">Kelas:</span>
                                    <div className="flex-1 border-b-2 border-slate-300 border-dotted h-6"></div>
                                 </div>
                            </div>
                        </div>

                        {/* Main Image Area */}
                        <div id="printable-content" className="flex-1 flex items-center justify-center p-2 border-2 border-dashed border-slate-100 rounded-2xl relative">
                             <img 
                                id="printable-image"
                                src={generatedImage.dataUrl} 
                                alt={generatedImage.prompt} 
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        {/* Footer */}
                         <div className="mt-6 flex justify-between items-end border-t border-slate-100 pt-4">
                            <div className="text-slate-400 font-display text-xs flex items-center gap-1">
                                <Icons.Sparkles size={12} />
                                <span>Selamat Belajar & Berkarya</span>
                            </div>
                            <div className="text-[10px] text-slate-300 italic">
                                Dicetak pada: {new Date().toLocaleDateString('id-ID')}
                            </div>
                         </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 text-center text-slate-500 text-sm italic border-t no-print">
                    "{generatedImage.prompt}"
                </div>
            </section>
        )}

        {/* History Gallery */}
        {history.length > 0 && (
            <section className="space-y-4 pt-8 border-t border-slate-200 no-print">
                <h3 className="font-display font-bold text-xl text-slate-600 flex items-center gap-2">
                    <Icons.Save className="text-brand-purple" size={24}/>
                    Galeri Gambar Sebelumnya
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {history.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => selectHistoryItem(item)}
                            className={`
                                cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:scale-105 bg-white shadow-sm
                                ${generatedImage?.id === item.id ? 'border-brand-blue ring-2 ring-brand-blue ring-offset-2' : 'border-slate-100 hover:border-brand-blue'}
                            `}
                        >
                            <div className="aspect-square w-full bg-slate-50 p-2">
                                <img src={item.dataUrl} alt={item.prompt} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <div className="p-2 text-xs font-medium text-slate-500 truncate text-center bg-white">
                                {item.prompt}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

      </main>

      <footer className="text-center py-8 text-slate-400 text-sm font-medium no-print">
         &copy; {new Date().getFullYear()} PAUD Al-Khoirot. Dibuat dengan Kasih Sayang & AI.
      </footer>
    </div>
  );
};

export default App;