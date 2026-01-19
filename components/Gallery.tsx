import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, Maximize2, Landmark, Mountain, Wine, Sparkles, Camera, Plus, Check } from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';
import { discoverMorePlaces, getPlaceDetails } from '../services/geminiService';
import { GalleryItem } from '../types';
import { Button } from './Button';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';

const ICON_MAP: Record<string, any> = {
    Landmark, Mountain, Wine, Camera
};

// Helper for optimized images
const getOptimizedUrl = (url: string, width: number) => {
    if (url.includes('unsplash.com')) {
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('w', width.toString());
            urlObj.searchParams.set('q', '80');
            urlObj.searchParams.set('auto', 'format');
            urlObj.searchParams.set('fit', 'crop');
            return urlObj.toString();
        } catch {
            return url.replace(/w=\d+/, `w=${width}`);
        }
    }
    return url;
};

export const Gallery: React.FC = () => {
  const { config } = useAppConfig();
  const { galleryPosts, shareGalleryPhoto, user } = useUser();
  const { addNotification } = useNotification();
  
  const galleryContent = config.content.gallery;
  const COLLECTIONS = galleryContent.collections;
  
  const [activeTab, setActiveTab] = useState<string>(COLLECTIONS[0]?.id || 'montpellier');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modalImageLoaded, setModalImageLoaded] = useState(false);
  const [dynamicImages, setDynamicImages] = useState<GalleryItem[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const tabsRef = useRef<HTMLDivElement>(null);

  // Merge dynamic shared collection
  const extendedCollections = useMemo(() => {
      const community = {
          id: 'community',
          title: 'Shared',
          subtitle: 'Guest Photos',
          description: 'Candid shots and memories from the weekend shared by everyone.',
          iconName: 'Camera',
          images: galleryPosts.map(p => ({
              url: p.url,
              alt: p.caption,
              caption: p.caption || 'Moment',
              description: `Posted by ${p.uploaderName} • ${new Date(p.timestamp).toLocaleDateString()}`,
              link: '',
              isCommunity: true
          }))
      };
      return [...COLLECTIONS, community];
  }, [COLLECTIONS, galleryPosts]);

  const activeCollection = extendedCollections.find(c => c.id === activeTab) || extendedCollections[0];
  
  // Combine static and dynamic images for current collection (if standard collection)
  // For 'community' collection, images are already in activeCollection.images
  const currentDynamic = dynamicImages.filter(img => (img as any).collectionId === activeTab);
  const allImages = [...activeCollection.images, ...currentDynamic];
  const displayImages = allImages;

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
      setModalImageLoaded(false); 
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedIndex]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024 && tabsRef.current) {
        const offset = 90; 
        const elementPosition = tabsRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const handleDiscoverMore = async () => {
      if (isDiscovering) return;
      setIsDiscovering(true);
      
      const currentNames = allImages.map(i => i.caption);
      const promptContext = `${activeCollection.title} (${activeCollection.subtitle}): ${activeCollection.description}`;
      const newPlaceNames = await discoverMorePlaces(promptContext, currentNames);
      
      const newGalleryItems: (GalleryItem & { collectionId: string, isDynamic: boolean })[] = [];
      
      for (const name of newPlaceNames) {
          const context = activeTab === 'montpellier' ? "Montpellier, France" : "Occitanie, France";
          const details = await getPlaceDetails(name, context);
          
          if (details && details.imageUrl) {
              newGalleryItems.push({
                  url: details.imageUrl,
                  alt: name,
                  caption: name,
                  description: details.summary || `Discovered by Céleste: ${name}`,
                  link: details.sources?.[0]?.uri,
                  isDynamic: true,
                  collectionId: activeTab
              });
          }
      }
      
      setDynamicImages(prev => [...prev, ...newGalleryItems]);
      setIsDiscovering(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      setIsUploading(true);
      try {
          // Simple prompt for caption or use default
          const caption = prompt("Add a caption (optional):") || "Shared Photo";
          await shareGalleryPhoto(file, caption);
          addNotification("Photo shared to the gallery!", "success");
          setActiveTab('community'); // Switch to community tab to see it
      } catch (err) {
          console.error(err);
          addNotification("Upload failed. Please try again.", "error");
      } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : (prev as number) - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : (prev as number) + 1));
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-med-sand dark:bg-slate-900 transition-colors duration-300">
      <div className="w-[92%] md:w-[85%] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            
            {/* Left Column: Context (Sticky) */}
            <div className="lg:w-1/3">
                <div className="lg:sticky lg:top-28">
                   <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs block mb-3">{galleryContent.subtitle}</span>
                   <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-med-blue dark:text-white mb-4 lg:mb-6 leading-none">
                       {galleryContent.title.split(' ').slice(0, 1).join(' ')}<br />
                       <span className="italic text-med-terracotta">{galleryContent.title.split(' ').slice(1).join(' ')}</span>
                   </h2>
                   
                   <div className="relative pl-6 border-l-4 border-med-terracotta/30 py-1 mb-6 lg:mb-8">
                        <p className="font-serif text-lg md:text-xl text-med-blue dark:text-blue-100 leading-relaxed italic">
                            "{galleryContent.quote}"
                        </p>
                   </div>

                   <div className="hidden lg:flex flex-col gap-3">
                      {extendedCollections.map((col) => {
                        const Icon = ICON_MAP[col.iconName] || Landmark;
                        const isActive = activeTab === col.id;
                        return (
                            <button
                              key={col.id}
                              onClick={() => handleTabChange(col.id)}
                              className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 border w-full text-left ${
                                isActive
                                  ? 'bg-med-blue text-white border-med-blue shadow-lg -translate-y-1'
                                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:border-med-blue/20'
                              }`}
                            >
                              <div className={`p-3 rounded-xl shrink-0 ${isActive ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                                <Icon size={20} className={isActive ? 'text-white' : 'text-med-terracotta'} />
                              </div>
                              <div>
                                <span className="block font-bold text-xs uppercase tracking-wider mb-1">{col.title}</span>
                                <span className="text-[10px] opacity-70 leading-tight block">
                                    {col.subtitle}
                                </span>
                              </div>
                            </button>
                        );
                      })}
                   </div>
                </div>
            </div>

            <div className="lg:w-2/3 min-h-[500px]">
               {/* Mobile Fixed Grid Tabs */}
               <div ref={tabsRef} className="lg:hidden sticky top-0 z-30 bg-med-sand/95 dark:bg-slate-900/95 backdrop-blur-md -mx-[4%] px-[4%] py-3 mb-8 border-b border-med-terracotta/10 transition-all duration-300">
                  <div className="flex overflow-x-auto gap-3 pb-1 scrollbar-hide snap-x">
                    {extendedCollections.map((col) => {
                        const Icon = ICON_MAP[col.iconName] || Landmark;
                        const isActive = activeTab === col.id;
                        return (
                            <button
                                key={col.id}
                                onClick={() => handleTabChange(col.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 border whitespace-nowrap snap-center ${
                                    isActive
                                    ? 'bg-med-blue text-white border-med-blue shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                <Icon size={14} className={isActive ? 'text-white' : 'text-med-terracotta'} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{col.title}</span>
                            </button>
                        );
                    })}
                  </div>
               </div>

               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[150px] md:auto-rows-[200px]">
                  
                  {/* Upload Card - Only show in Community Tab */}
                  {activeTab === 'community' && user && (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-med-blue/5 dark:bg-blue-900/20 border-2 border-dashed border-med-blue/20 hover:border-med-blue hover:bg-med-blue/10 transition-all cursor-pointer group row-span-1"
                      >
                          <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleUpload} 
                              accept="image/*" 
                              className="hidden" 
                          />
                          {isUploading ? (
                              <Loader2 size={24} className="text-med-blue animate-spin" />
                          ) : (
                              <Camera size={24} className="text-med-blue group-hover:scale-110 transition-transform" />
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-widest text-med-blue text-center">
                              {isUploading ? "Uploading..." : "Add Photo"}
                          </span>
                      </div>
                  )}

                  {displayImages.map((img, idx) => {
                      const isSpanning = idx % 3 === 0 && activeTab !== 'community'; // Don't span in community grid for uniform look
                      const sizes = isSpanning 
                        ? "(max-width: 768px) 100vw, 66vw" 
                        : "(max-width: 768px) 50vw, 33vw";
                      
                      return (
                        <div 
                            key={`${img.url}-${idx}`}
                            onClick={() => setSelectedIndex(idx)}
                            className={`relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-500 ${isSpanning ? 'md:col-span-2' : ''} ${(idx % 5 === 0 && activeTab !== 'community') ? 'row-span-2' : ''}`}
                        >
                            <img 
                                src={getOptimizedUrl(img.url, 600)} 
                                srcSet={`
                                    ${getOptimizedUrl(img.url, 400)} 400w,
                                    ${getOptimizedUrl(img.url, 800)} 800w,
                                    ${getOptimizedUrl(img.url, 1200)} 1200w
                                `}
                                sizes={sizes}
                                alt={img.alt}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                            {(img as any).isDynamic && (
                                <div className="absolute top-2 right-2 bg-med-terracotta text-white p-1 rounded-full shadow-lg z-10 animate-in zoom-in">
                                    <Sparkles size={12} />
                                </div>
                            )}
                            {(img as any).isCommunity && (
                                <div className="absolute top-2 right-2 bg-med-blue text-white p-1 rounded-full shadow-lg z-10 animate-in zoom-in">
                                    <Camera size={12} />
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                <p className="text-white text-xs font-bold">{img.caption}</p>
                            </div>
                        </div>
                      );
                  })}
                  
                  {/* Discover More Button - Only for non-community static tabs */}
                  {activeTab !== 'community' && (
                      <div 
                        onClick={handleDiscoverMore}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-med-terracotta hover:bg-med-terracotta/5 transition-all cursor-pointer group"
                      >
                          {isDiscovering ? (
                              <Loader2 size={24} className="text-med-terracotta animate-spin" />
                          ) : (
                              <Sparkles size={24} className="text-gray-300 group-hover:text-med-terracotta transition-colors" />
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-med-terracotta text-center">
                              {isDiscovering ? "Asking Céleste..." : `Discover ${activeCollection.title}`}
                          </span>
                      </div>
                  )}
               </div>
            </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
            
            <div className="absolute top-6 right-6 z-50">
                <Button 
                    onClick={() => setSelectedIndex(null)} 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
                >
                    <X size={24} />
                </Button>
            </div>

            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50">
                <Button 
                    onClick={handlePrev} 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
                >
                    <ChevronLeft size={24} />
                </Button>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50">
                <Button 
                    onClick={handleNext} 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
                >
                    <ChevronRight size={24} />
                </Button>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-12 relative" onClick={() => setSelectedIndex(null)}>
                <div 
                    className="relative max-w-5xl w-full max-h-[80vh] flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {!modalImageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50">
                            <Loader2 size={48} className="animate-spin" />
                        </div>
                    )}
                    <img 
                        src={getOptimizedUrl(displayImages[selectedIndex].url, 1600)} 
                        srcSet={`
                            ${getOptimizedUrl(displayImages[selectedIndex].url, 800)} 800w,
                            ${getOptimizedUrl(displayImages[selectedIndex].url, 1600)} 1600w
                        `}
                        sizes="100vw"
                        alt={displayImages[selectedIndex].alt}
                        className={`max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg transition-opacity duration-500 ${modalImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setModalImageLoaded(true)}
                    />
                </div>
                
                <div className="mt-6 text-center max-w-2xl px-4" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-white text-xl font-serif mb-2 flex items-center justify-center gap-2">
                        {displayImages[selectedIndex].caption}
                        {(displayImages[selectedIndex] as any).isDynamic && <Sparkles size={14} className="text-med-terracotta" />}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">{displayImages[selectedIndex].description}</p>
                    {displayImages[selectedIndex].link && (
                        <a 
                            href={displayImages[selectedIndex].link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-4 text-med-terracotta hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Learn More <Maximize2 size={12} />
                        </a>
                    )}
                </div>
            </div>
        </div>
      )}
    </section>
  );
};