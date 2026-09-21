import {useState,useMemo,useEffect,useRef} from "react";
import { formatPrice } from "../src/utils/catalog.js";
import { createIcons, icons } from "lucide";

export default function ProductCard({
    product,
    onAddToCart,
    onUpdateCartQuantity,
    onSelectProduct,
    cartQty
}) {
    
const [currentImgIndex, setCurrentImgIndex] = useState(0);
const [selectedVariant, setSelectedVariant] = useState(null);
const [isQtyOpen, setIsQtyOpen] = useState(false);
const [tempQty, setTempQty] = useState(1);
const timerRef = useRef(null);

const rangoPrecios = useMemo(() => {
    const precios = (product.variantes || [])
        .map(v => Number(v.precio_min))
        .filter(precio => !isNaN(precio));
    if (precios.length === 0) {
        return {
            min: 0,
            max: 0
        };
    }
    return {
        min: Math.min(...precios),
        max: Math.max(...precios)
    };
}, [product.variantes]);

const imagesList = useMemo(() => {
    // El producto tiene imágenes generales
    if (product.imagenes?.length > 0) {
        return product.imagenes
            .filter(Boolean)
            .slice(0, 2);
    }
    // Si no tiene imágenes generales buscamos la PRIMERA variante que tenga imagen
    const primeraVarianteConImagen = (product.variantes || [])
    .find(variante =>
        variante.imagen?.length > 0 ||
        variante.atributos?.color?.imagen?.length > 0
    );
    if (primeraVarianteConImagen) {
        // Imagen de la variante
        if (primeraVarianteConImagen.imagen?.length > 0) {
            return primeraVarianteConImagen.imagen
                .filter(Boolean)
                .slice(0, 2);
        }
        // Imagen del color
        if (primeraVarianteConImagen.atributos?.color?.imagen?.length > 0) {
            return primeraVarianteConImagen.atributos.color.imagen
                .filter(Boolean)
                .slice(0, 2);
        }
    }
//Sin imagen
return [];
}, [product.imagenes, product.variantes]);

const toggleImage = (e) => {
    e.stopPropagation(); 
    setCurrentImgIndex(prev => (prev === 0 ? 1 : 0));
};

const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isQtyOpen) return;
    if (product.variantes?.length === 1 && productVariantData) {
        onAddToCart(productVariantData, 1);
        return;
    }
    onSelectProduct(product);
};

const openQtySelector = (e) => {
    e.stopPropagation();
    const stockDisponible = Number(productVariantData?.stock || 0);
    setTempQty(
        Math.min(
            cartQty || 1,
            stockDisponible
        )
    );
    setIsQtyOpen(true);
};

const increaseQty = (e) => {
    e.stopPropagation();
    const stockDisponible = Number(productVariantData?.stock || 0);
    setTempQty(prev =>
        Math.min(prev + 1, stockDisponible)
    );
};


const decreaseQty = (e) => {
    e.stopPropagation();
    setTempQty(prev => Math.max(prev - 1, 1));
};
const variantToAdd =
    selectedVariant ||
    (product.variantes?.length === 1
        ? product.variantes[0]
        : null);
        const productVariantData = variantToAdd
    ? {
        ...product,
        variante: variantToAdd,
        sku: variantToAdd.sku,
        stock: variantToAdd.stock,
        precioSeleccionado: variantToAdd.precio_min
    }
    : null;
    
const colorsList = useMemo(() => {
    const colores = product.variantes
        ?.map(variante => variante.atributos?.color)
        .filter(Boolean);
    const unicos = [];
    colores?.forEach(color => {
        const existe = unicos.some(
            c => c.nombre.toLowerCase() === color.nombre.toLowerCase()
        );
        if (!existe) {
            unicos.push(color);
        }
    });
    return unicos;
}, [product.variantes]);

const getVariantForColor = (colorName) => {
    return product.variantes?.find(
        variante =>
            variante.atributos?.color?.nombre?.toLowerCase() ===
            colorName.toLowerCase()
    );
};

const handleColorSelect = (color) => {
    const variante = getVariantForColor(color.nombre);
    if (!variante) return;
    setSelectedVariant(variante);
    const imagenColor = variante.atributos?.color?.imagen?.[0];
    if (imagenColor) {
        const index = imagesList.indexOf(imagenColor);
        if (index !== -1) {
            setCurrentImgIndex(index);
        }
    }
};

const selectedVariantImage =selectedVariant?.atributos?.color?.imagen?.[0];
const sinStockDisponible = tempQty >= Number(productVariantData?.stock || 0);
const currentImage = selectedVariantImage || imagesList[currentImgIndex] || imagesList[0];

useEffect(() => {
    createIcons({ icons });
}, [isQtyOpen, tempQty]);

useEffect(() => {
    if (!isQtyOpen) return;
    if (timerRef.current) {
        clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
        if (productVariantData) {
            onUpdateCartQuantity(productVariantData, tempQty);
        }
        setIsQtyOpen(false);
        timerRef.current = null;
    }, 2000);
    return () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };
}, [isQtyOpen, tempQty, productVariantData, onUpdateCartQuantity]);

return (

    <div className="group cursor-pointer"  onClick={() => onSelectProduct(product)}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-white shadow-sm border border-neutral-100">
            <img 
                src={currentImage} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt={product.name} 
            />
                        
            {product?.variantes?.length === 1 && (
                <div className="absolute bottom-6 right-6 z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {cartQty === 0 && !isQtyOpen && (
                        <button
                            onClick={handleAddToCart}
                            className="bg-white text-black p-5 rounded-full shadow-2xl translate-y-4 opacity-0 group-hover:translate-y-0
                                        group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white"
                        >
                            <i data-lucide="plus" className="w-6 h-6"></i>
                        </button>
                    )}
                    
                    {cartQty > 0 && !isQtyOpen && (
                        <button
                            onClick={openQtySelector}
                            className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center
                                        font-bold text-lg shadow-2xl transition-all duration-300 hover:scale-105"
                        >
                            {cartQty}
                        </button>
                    )}

                    {isQtyOpen && (
                        <div
                            className=" relative flex items-center bg-white text-black rounded-full shadow-2xl
                                        transition-all duration-300"
                        >
                            <button
                                onClick={decreaseQty}
                                className="w-14 h-14 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                            >
                                <i data-lucide="minus" className="w-5 h-5"></i>
                            </button>

                            <span className="w-10 text-center font-bold text-lg">
                                {tempQty}
                            </span>

                            <div className="relative group">
                                <button
                                    onClick={increaseQty}
                                    disabled={sinStockDisponible}
                                    className={`w-14 h-14 flex items-center justify-center transition-all
                                        ${
                                            sinStockDisponible
                                                ? "text-neutral-300 cursor-not-allowed"
                                                : "hover:bg-neutral-100 active:scale-90"
                                        }
                                    `}
                                >
                                    <i data-lucide="plus" className="w-5 h-5"></i>
                                </button>

                                {sinStockDisponible && (
                                    <div
                                        className=" pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap bg-black
                                        text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-xl opacity-0 translate-y-1 group-hover:opacity-100
                                        group-hover:translate-y-0 transition-all duration-200 z-50"
                                    >
                                        Máximo disponible: {productVariantData?.stock}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CONTROLES DE IMAGEN */}
            {imagesList.length > 1 && (
                <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full
                                flex items-center gap-1.5 shadow-sm border border-neutral-200/40 select-none z-10">
                    {imagesList.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(idx); }}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 
                                ${
                                    idx === currentImgIndex
                                        ? "bg-neutral-800 scale-110"
                                        : "bg-neutral-400/60"
                            }`}
                        />
                    ))}
                    
                    <button 
                        onClick={toggleImage}
                        className="text-[10px] text-neutral-500 font-bold ml-1 hover:text-black transition-colors"
                    >
                        ➔
                    </button>
                </div>
            )}
        </div>

        {/* DATOS*/}
        <div className="mt-6 flex justify-between items-start px-2">
            <div>
                <h3 className="font-bold text-xl mb-1 text-neutral-900">{product.descripcion}</h3>
                <p className="text-neutral-400 text-sm uppercase tracking-widest mb-3">
                    {product.categorias?.[0] || ""}
                </p>
                
                {/* Muestras de color */}
                {colorsList.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                        {colorsList.slice(0, 3).map((color, index) => (
                            <button
                                key={color.nombre}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleColorSelect(color);
                                }}
                                title={color.nombre}
                                style={{
                                    backgroundColor: color.hex || "#E0E0E0"
                                }}
                                className={`
                                    w-4 h-4
                                    rounded-full
                                    border
                                    border-neutral-300
                                    shadow-sm
                                    transition-all
                                    ${selectedVariant?.atributos?.color?.nombre?.toLowerCase() ===
                                    color.nombre.toLowerCase()
                                        ? "ring-2 ring-black ring-offset-2"
                                        : ""}
                                `}
                            />
                        ))}

                        {colorsList.length > 3 && (
                            <span className="text-xs font-medium text-neutral-400 ml-0.5">
                                +{colorsList.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <p className="font-black text-xl tabular-nums text-neutral-900">
                {rangoPrecios.min === rangoPrecios.max
                    ? formatPrice(rangoPrecios.min)
                    : `${formatPrice(rangoPrecios.min)} – ${formatPrice(rangoPrecios.max)}`
                }
            </p>
        </div>
    </div>
);
}