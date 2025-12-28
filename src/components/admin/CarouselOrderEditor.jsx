import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CorporateLecture } from '@/entities/CorporateLecture';
import { PersonalWorkshop } from '@/entities/PersonalWorkshop';
import { GripVertical, Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const CarouselOrderEditor = ({ siteSettings, onSettingsChange }) => {
    const { language } = useLanguage();
    const [allItems, setAllItems] = useState([]);
    const [orderedItems, setOrderedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const showPersonal = siteSettings?.workshops_carousel_show_personal;

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const corporate = await CorporateLecture.filter({ is_published: true });
                let personal = [];
                if (showPersonal) {
                    personal = await PersonalWorkshop.filter({ is_published: true });
                }

                const mappedCorporate = corporate.map(item => ({
                    id: 'c-' + item.id,
                    title: language === 'he' ? item.title_he : item.title_en,
                }));

                const mappedPersonal = personal.map(item => ({
                    id: 'p-' + item.id,
                    title: language === 'he' ? item.title_he : item.title_en,
                }));

                const all = [...mappedCorporate, ...mappedPersonal];
                setAllItems(all);

            } catch (error) {
                console.error("Failed to fetch carousel items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [showPersonal, language]);

    useEffect(() => {
        if (loading || !allItems.length) return;
        
        const currentOrderIds = (siteSettings.carousel_items_order || []).map(i => i.id);
        
        const ordered = [];
        const remaining = [...allItems];

        // Populate with items from saved order, ensuring they are currently available
        currentOrderIds.forEach(orderId => {
            const foundIndex = remaining.findIndex(item => item.id === orderId);
            if (foundIndex > -1) {
                ordered.push(remaining[foundIndex]);
                remaining.splice(foundIndex, 1);
            }
        });

        // Add any new/unsorted items to the end
        setOrderedItems([...ordered, ...remaining]);

    }, [allItems, siteSettings.carousel_items_order, loading]);


    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(orderedItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setOrderedItems(items);
        const newOrderToSave = items.map(item => ({ id: item.id, title: item.title }));
        onSettingsChange('carousel_items_order', newOrderToSave);
    };

    if (loading) {
        return <div className="flex justify-center items-center p-4"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="carouselItems">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 rounded-md border p-4 bg-gray-50 max-h-96 overflow-y-auto">
                        {orderedItems.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`flex items-center p-3 rounded-md border transition-shadow ${snapshot.isDragging ? 'shadow-lg bg-blue-50' : 'bg-white shadow-sm'}`}
                                    >
                                        <GripVertical className="text-gray-400 ml-4 rtl:ml-0 rtl:mr-4" />
                                        <span>{item.title}</span>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        {orderedItems.length === 0 && (
                            <div className="text-center text-gray-500 py-4">
                                לא נמצאו פריטים להצגה בקרוסלה.
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default CarouselOrderEditor;