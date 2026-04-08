import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ImagePlus, Package, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AddProductPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        sku: '',
        basePrice: '',
        category: '',
        stock: '',
        description: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.brand || !formData.basePrice) {
            toast.error("Name, Brand, and Price are required.");
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('brand', formData.brand);
            submitData.append('basePrice', formData.basePrice);
            submitData.append('category', formData.category);
            submitData.append('stock', formData.stock);
            submitData.append('description', formData.description);
            if (formData.sku) submitData.append('sku', formData.sku);

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            const res = await api.post('/api/admin/products/add', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success(res.data.message || 'Product created successfully.');
                navigate('/admin/inventory');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to add product.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#F7F5F0] min-h-full pb-10 pt-4 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-2">
                <Link to="/admin/inventory" className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors w-fit">
                    <ArrowLeft className="w-3 h-3" /> Back to Inventory
                </Link>
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">Manual Intake</h1>
                <p className="text-sm font-medium text-stone-500">Add a new product to the catalog via direct entry.</p>
            </div>

            {/* Form Container */}
            <div className="bg-white border border-stone-200 shadow-none p-8 rounded-sm max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">Product Name *</label>
                            <input 
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full bg-stone-50 border border-stone-200 rounded-sm px-4 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-shadow"
                                placeholder="e.g. Air Jordan 1 High"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">Brand *</label>
                            <input 
                                type="text"
                                name="brand"
                                required
                                value={formData.brand}
                                onChange={handleInputChange}
                                className="w-full bg-stone-50 border border-stone-200 rounded-sm px-4 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-shadow"
                                placeholder="e.g. Nike"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">Price (₹) *</label>
                            <input 
                                type="number"
                                name="basePrice"
                                required
                                min="0" step="0.01"
                                value={formData.basePrice}
                                onChange={handleInputChange}
                                className="w-full bg-stone-50 border border-stone-200 rounded-sm px-4 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-shadow"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">Category</label>
                            <input 
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full bg-stone-50 border border-stone-200 rounded-sm px-4 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-shadow"
                                placeholder="e.g. Sneakers"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">Initial Stock</label>
                            <input 
                                type="number"
                                name="stock"
                                min="0"
                                value={formData.stock}
                                onChange={handleInputChange}
                                className="w-full bg-stone-50 border border-stone-200 rounded-sm px-4 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-shadow"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">SKU</label>
                            <input 
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleInputChange}
                                className="w-full bg-stone-50 border border-stone-200 rounded-sm px-4 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-shadow"
                                placeholder="Item SKU"
                            />
                        </div>
                    </div>

                    {/* Full width description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full bg-stone-50 border border-stone-200 rounded-sm px-4 py-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-shadow resize-none"
                            placeholder="Detailed product information..."
                        />
                    </div>

                    {/* Image Upload section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">Product Image</label>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-stone-200 border-dashed rounded-sm p-6 bg-stone-50/50">
                            {previewUrl ? (
                                <div className="relative group w-32 h-32 bg-white border border-stone-200 rounded-sm flex items-center justify-center p-2 overflow-hidden flex-shrink-0">
                                    <img src={previewUrl} alt="Preview" className="object-contain w-full h-full" />
                                </div>
                            ) : (
                                <div className="w-32 h-32 bg-stone-100 border border-stone-200 rounded-sm flex flex-col items-center justify-center p-2 text-stone-300 flex-shrink-0">
                                    <Package className="w-8 h-8 mb-2 absolute opacity-10" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest z-10">No Image</span>
                                </div>
                            )}

                            <div className="flex-1 space-y-4 text-center sm:text-left mt-4 sm:mt-0">
                                <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-black uppercase tracking-widest rounded-sm cursor-pointer transition-colors shadow-sm">
                                    <ImagePlus className="w-4 h-4" /> Select File
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                                <p className="text-[11px] font-medium text-stone-500 leading-relaxed max-w-sm">
                                    Upload a high quality square image (PNG, JPG). Backgrounds will be evaluated. Max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    <hr className="border-stone-100" />

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#800000] hover:bg-[#600000] disabled:bg-stone-300 disabled:text-stone-500 text-white text-xs font-black uppercase tracking-widest rounded-sm transition-all shadow-sm"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                            {loading ? 'Ingesting...' : 'Save Product'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
