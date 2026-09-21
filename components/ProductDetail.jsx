import {useState,useMemo,useEffect} from "react";
import { formatPrice,impuesto } from "../src/utils/catalog.js";
import {motion,AnimatePresence} from "framer-motion";

export default function ProductDetail({
    product,
    onClose,
    onAddToCart,
    cart,
    removeFromCart,
    onNavigate,
    activeRubro,
    activeCategory,
    activeSubcategory,
    products,
    trailDelProducto
}) {
const [variantWarning, setVariantWarning] = useState(null);
const [cartAdded, setCartAdded] = useState(false);
const [cartAction, setCartAction] = useState(null);
const [currentImgIndex, setCurrentImgIndex] = useState(0);
const [qty, setQty] = useState(1);
const [selectedAttrs, setSelectedAttrs] = useState(() => {
    const primeraVariante = product?.variantes?.[0];
    const atributos = primeraVariante?.atributos || {};
    const inicial = {};
    if (atributos.color?.nombre) {
        inicial.color = atributos.color.nombre;
    }
    return inicial;
});

useEffect(() => {
    if (!product) return;
    document.body.style.overflow = "hidden";
    return () => {
        document.body.style.overflow = "";
    };
}, [product]);

if (!product) return null;

//Variante
const variantes = product.variantes || [];

//Colores
const colores = useMemo(() => {
    const encontrados = [];
    variantes.forEach(variante => {
        const color = variante.atributos?.color;
        if (!color?.nombre) return;
        const existe = encontrados.some(
            c => c.nombre.toLowerCase() === color.nombre.toLowerCase()
        );
        if (!existe) {
            encontrados.push(color);
        }
    });
    return encontrados;
}, [variantes]);

//Color Seleccionado
const colorActual = useMemo(() => {
if (!selectedAttrs.color) return null;
return colores.find(
    color =>
        color.nombre.toLowerCase() === selectedAttrs.color.toLowerCase()
);
}, [colores, selectedAttrs.color]);

//Variantes del Color seleccionado
const variantesDelColor = useMemo(() => {
    if (!selectedAttrs.color) {
        return variantes;
    }
    return variantes.filter(variante => {
        const color = variante.atributos?.color?.nombre;
        return (
            color &&
            color.toLowerCase() === selectedAttrs.color.toLowerCase()
        );
    });
}, [variantes, selectedAttrs.color]);

//Atributos de lo seleccionado
const attributeOptions = useMemo(() => {
    const resultado = {};
    variantes.forEach(variante => {
        const atributos = variante.atributos || {};
        Object.entries(atributos).forEach(([key, value]) => {
            if (key === "color") return;
            if (!value) return;
            if (!resultado[key]) {
            resultado[key] = [];
            }
            if (!resultado[key].includes(value)) {
                resultado[key].push(value);
            }
        });
    });
    Object.keys(resultado).forEach(key => {
        resultado[key].sort((a, b) =>
            String(a).localeCompare(
                String(b),
                undefined,
                { numeric: true }
            )
        );
    });
    return resultado;
}, [variantes]);


//Hexa del color
const obtenerValorAtributo = (variante, nombre) => {
    const valor = variante.atributos?.[nombre];
    if (nombre === "color") {
        return valor?.nombre || "";
    }
    return valor ?? "";
};

// IMÁGENES
const imagesList = useMemo(() => {
    const pick = (variante) => {
        const propias = [...new Set((variante?.imagen || []).filter(Boolean))];
        if (propias.length) return propias.slice(0, 5);
        const deColor = [...new Set((variante?.atributos?.color?.imagen || []).filter(Boolean))];
        if (deColor.length) return deColor.slice(0, 5);
        return [];
    };
    const attrsElegidos = Object.entries(selectedAttrs).filter(
        ([, valor]) => valor != null && valor !== ""
    );
    if (attrsElegidos.length > 0) {
        const matching = (variantes || []).filter(variante =>
            attrsElegidos.every(([nombre, valor]) =>
                String(obtenerValorAtributo(variante, nombre)).toLowerCase() ===
                String(valor).toLowerCase()
            )
        );
        // Variante exacta
        if (matching.length === 1) {
            const imgsExacta = pick(matching[0]);
            if (imgsExacta.length) return imgsExacta;
        }
        // Las que matchean
        const vistas = new Set();
        const union = [];
        matching.forEach(variante => {
            pick(variante).forEach(src => {
                if (!vistas.has(src)) {
                    vistas.add(src);
                    union.push(src);
                }
            });
        });
        if (union.length) return union.slice(0, 5);
    }
    const generales = [...new Set((product.imagenes || []).filter(Boolean))];
    if (generales.length) return generales.slice(0, 5);
    const primera =
        (variantes || []).find(v => pick(v).length > 0) ||
        variantes[0];
    return pick(primera);
}, [variantes, selectedAttrs, product.imagenes]); 

// IMAGEN ACTUAL
const currentImage = imagesList[currentImgIndex] ||
imagesList[0] ||
"https://images.vexels.com/media/users/3/157124/isolated/preview/51cc4dcf083b945aabf1f07ef72c9d59-icono-de-trazo-de-llave-y-destornillador.png";

// HANDLER DE ATRIBUTOS
const handleAttrChange = (key, value) => {
    setCurrentImgIndex(0);
    setSelectedAttrs(prev => {
        const actual = prev[key];
        const mismo =
            actual != null &&
            String(actual).toLowerCase() === String(value).toLowerCase();

            // Color distinto con reseteo de atributos
            if (key === "color") {
                if (mismo) {
                    const next = { ...prev };
                    delete next.color;
                    return next;
                }
                return { color: value };
            }
            if (mismo) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
        return {
            ...prev,
            [key]: value
        };
    });
};

// VARIANTE ACTUAL
const varianteSeleccionada = useMemo(() => {
    //Variante sin atributos
    if (Object.keys(selectedAttrs).length === 0) {
        if (variantes.length === 1) {
            return variantes[0];
        }
        return null;
    }
    return variantes.find(variante => {
        return Object.entries(selectedAttrs).every(
            ([nombre, valorSeleccionado]) => {
                const valorVariante =
                    obtenerValorAtributo(
                        variante,
                        nombre
                    );
                return (
                    String(valorVariante).toLowerCase() ===
                    String(valorSeleccionado).toLowerCase()
                );
            }
        );
    });
    }, [
        variantes,
        selectedAttrs
    ]);

    const isAttributeAvailable = (
        nombreAtributo,
        valor
    ) => {
        return variantes.some(variante => {
            // Comprobamos los demás atributos seleccionados.
            const coincideConLosDemas =
                Object.entries(selectedAttrs).every(
                    ([nombre, valorSeleccionado]) => {
                        // Ignoramos el atributo que estamos evaluando actualmente.
                        if (nombre === nombreAtributo) {
                            return true;
                        }
                        const valorVariante =
                            obtenerValorAtributo(
                                variante,
                                nombre
                            );
                        return (
                            String(valorVariante).toLowerCase() ===
                            String(valorSeleccionado).toLowerCase()
                        );

                    }
                );
            if (!coincideConLosDemas) {
                return false;
            }
            // Por ultimo comprobamos la opción que estamos evaluando.
            const valorVariante =
                obtenerValorAtributo(
                    variante,
                    nombreAtributo
                );
            return (
                String(valorVariante).toLowerCase() ===
                String(valor).toLowerCase()
            );
        });
    };

    useEffect(() => {
        if (!varianteSeleccionada) {
            setQty(1);
            return;
        }
        const itemEnCarrito = cart.find(
            item => item.sku === varianteSeleccionada.sku
        );
        if (itemEnCarrito) {
            setQty(Number(itemEnCarrito.qty) || 1);
        } else {
            setQty(1);
        }
    }, [varianteSeleccionada, cart]);

// STOCK
const stockActual =
varianteSeleccionada?.stock ??
variantesDelColor.reduce(
    (total, variante) =>
        total + Number(variante.stock || 0),
    0
);

useEffect(() => {
    if (!stockActual) return;
    setQty(prev => Math.min(prev, stockActual));
}, [stockActual]);

// SKU
const skuActual = varianteSeleccionada?.sku || null;

// RANGO DE PRECIOS
const rangoPrecios = useMemo(() => {
    const precios = variantesDelColor
        .map(v => {
            const min = Number(v.precio_min || 0);
            const max = Number(v.precio_max || 0);
            return {
                min,
                max: max > 0 ? max : min
            };
        })
        .filter(v => v.min > 0);
        if (precios.length === 0) {
            const precio = Number(product.precio_min || 0);
            return {
                min: precio,
                max: precio
            };
        }
        return {
            min: Math.min(...precios.map(p => p.min)),
            max: Math.max(...precios.map(p => p.max))
        };
}, [variantesDelColor, product.precio_min]);

const mostrandoVarianteExacta = !!varianteSeleccionada;
const precioMinActual = mostrandoVarianteExacta
    ? Number(varianteSeleccionada.precio_min || 0)
    : rangoPrecios.min;
const precioMaxActual = mostrandoVarianteExacta
    ? (
        Number(varianteSeleccionada.precio_max) > 0
        ? Number(varianteSeleccionada.precio_max)
        : Number(varianteSeleccionada.precio_min || 0)
    )
    : rangoPrecios.max;

// NAVEGACIÓN DE IMÁGENES
const handlePrevImage = (e) => {
e.stopPropagation();
setCurrentImgIndex(prev => {
    if (imagesList.length === 0) {
        return 0;
    }
    return prev === 0
        ? imagesList.length - 1
        : prev - 1;
    });
};

const handleNextImage = (e) => {
e.stopPropagation();
setCurrentImgIndex(prev => {
    if (imagesList.length === 0) {
        return 0;
    }
    return prev === imagesList.length - 1
        ? 0
        : prev + 1;
    });
};

// AGREGAR AL CARRITO
const handleAdd = () => {
    const faltantes = [];
    if (colores.length > 0 && !selectedAttrs.color) {
        faltantes.push("Color");
    }
    Object.keys(attributeOptions).forEach(key => {
        if (!selectedAttrs[key]) {
            faltantes.push(
                key.charAt(0).toUpperCase() + key.slice(1)
            );
        }
    });
    if (faltantes.length > 0) {
        setVariantWarning(faltantes);
        setTimeout(() => {
            setVariantWarning(null);
        }, 2000);
    return;
    }
    const esModificacion = estaEnCarrito;
    const productoParaCarrito = {
        ...product,
        variante: varianteSeleccionada,
        stock: varianteSeleccionada.stock,
        sku: varianteSeleccionada.sku,
        precioSeleccionado: varianteSeleccionada.precio_min,
        imagenCarrito: currentImage
    };
    onAddToCart(
        productoParaCarrito,
        qty,
        { modificar: esModificacion }
    );
    setCartAction(esModificacion ? "modified" : "added");
    setCartAdded(true);
    setTimeout(() => {
        setCartAdded(false);
    }, 2000);
};

const increaseQty = () => {
        setQty(prev => Math.min(prev + 1, stockActual));
    };

const decreaseQty = () => {
    if (qty > 1) {
        setQty(prev => prev - 1);
        return;
    }
    //solo elimino si es que hay
    if (qty === 1 && estaEnCarrito && varianteSeleccionada) {
        removeFromCart(varianteSeleccionada.sku);
        setCartAction("removed");
        setCartAdded(true);
        setTimeout(() => {
            setCartAdded(false);
        }, 2000);
    }
};

useEffect(() => {
    const handleKeyboard = (e) => {
        // Si no hay imágenes, no hacemos nada
        if (imagesList.length <= 1) return;
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            e.stopPropagation();
            setCurrentImgIndex(prev =>
                prev === 0
                    ? imagesList.length - 1
                    : prev - 1
            );
        }
        if (e.key === "ArrowRight") {
            e.preventDefault();
            e.stopPropagation();
            setCurrentImgIndex(prev =>
                prev === imagesList.length - 1
                    ? 0
                    : prev + 1
            );
        }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => {
        window.removeEventListener("keydown", handleKeyboard);
    };
}, [imagesList.length]);

const itemEnCarrito = useMemo(() => {
    if (!skuActual) return null;
    return cart.find(item => item.sku === skuActual) || null;
}, [cart, skuActual]);

const estaEnCarrito = !!itemEnCarrito;
const puedeEliminar = qty === 1 && !!itemEnCarrito;
const botonDeshabilitado = qty === 1 && !itemEnCarrito;
const puedeDisminuir = qty > 1;
const trail = trailDelProducto(
    product,
    { activeRubro, activeCategory, activeSubcategory },
    products
);

return (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
    >
        {/* FONDO */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* FICHA */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] shadow-2xl"
            >

                {/* BOTÓN CERRAR */}
                <button
                    onClick={onClose}
                    className="absolute top-6 left-6 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:bg-black hover:text-white transition"
                >
                    <i
                        data-lucide="arrow-left"
                        className="w-5 h-5"
                    />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* IMAGEN */}
                    <div className="flex flex-col bg-white">
                        <div className="relative flex-1 min-h-[380px] lg:min-h-[440px]">
                            <img
                                src={currentImage}
                                alt={product.descripcion}
                                className="w-full h-full min-h-[380px] lg:min-h-[440px] object-cover"
                            />
                            {imagesList.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-black hover:text-white transition"
                                    >
                                        <i data-lucide="chevron-left" className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-black hover:text-white transition"
                                    >
                                        <i data-lucide="chevron-right" className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {imagesList.length > 1 && (
                            <div className="flex justify-center gap-2 px-4 py-3">
                                {imagesList.map((src, idx) => (
                                    <button
                                        key={src + idx}
                                        type="button"
                                        onClick={() => setCurrentImgIndex(idx)}
                                        className={`shrink-0 w-16 h-20 rounded-2xl overflow-hidden
                                            border-2 transition
                                            ${
                                                idx === currentImgIndex
                                                    ? "border-black"
                                                    : "border-transparent opacity-60 hover:opacity-100"
                                            }
                                        `}
                                    >
                                        <img
                                            src={src}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* INFORMACIÓN */}
                    <div className="p-8 md:p-12">

                        {/* BREADCRUMB */}
                        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 mb-6">
                            <button type="button" onClick={() => onNavigate({})}>
                                <i data-lucide="house" className="w-4 h-4" />
                            </button>
                            {trail.rubro && (
                                <>
                                    <span>›</span>
                                    <button
                                        type="button"
                                        onClick={() => onNavigate({ rubro: trail.rubro })}
                                        className="hover:text-black"
                                    >
                                        {trail.rubro}
                                    </button>
                                </>
                            )}
                            {trail.categoria && (
                                <>
                                    <span>›</span>
                                    <button
                                        type="button"
                                        onClick={() => onNavigate({
                                            rubro: trail.rubro,
                                            categoria: trail.categoria
                                        })}
                                        className="hover:text-black"
                                    >
                                        {trail.categoria}
                                    </button>
                                </>
                            )}
                            {trail.subcategoria && (
                                <>
                                    <span>›</span>
                                    <button
                                        type="button"
                                        onClick={() => onNavigate({
                                            rubro: trail.rubro,
                                            categoria: trail.categoria,
                                            subcategoria: trail.subcategoria
                                        })}
                                        className="hover:text-black"
                                    >
                                        {trail.subcategoria}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* MARCA */}
                        {product.marca && (
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 mb-3">
                                {product.marca}
                            </p>
                        )}

                        {/* TÍTULO */}
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900">
                            {product.descripcion}
                        </h2>

                        {/* CÓDIGO / ESTADO */}
                        <div className="flex flex-wrap gap-3 mt-5">
                            {product.codigo && (
                                <span className="px-4 py-2 rounded-full bg-neutral-100 text-xs font-bold">
                                    Código: {product.codigo}
                                </span>
                            )}
                            {varianteSeleccionada?.estado && (
                                <span className="px-4 py-2 rounded-full bg-neutral-100 text-xs font-bold uppercase">
                                    {varianteSeleccionada.estado}
                                </span>
                            )}
                            {skuActual && (
                                <span className="px-4 py-2 rounded-full bg-neutral-100 text-xs font-bold">
                                    SKU: {skuActual}
                                </span>
                            )}                       
                        </div>

                        {/* PRECIO */}
                        <div className="mt-8">
                            <p className="text-4xl font-black text-neutral-900">
                                {precioMinActual === precioMaxActual
                                    ? formatPrice(precioMinActual)
                                    : `${formatPrice(precioMinActual)} – ${formatPrice(precioMaxActual)}`
                                }
                            </p>
                            <p className="mt-1 text-sm text-neutral-400">
                                Precio sin impuestos: {
                                    precioMinActual === precioMaxActual
                                        ? formatPrice(precioMinActual / impuesto)
                                        : `${formatPrice(precioMinActual / impuesto)} – ${formatPrice(precioMaxActual / impuesto)}`
                                }
                            </p>                       
                        </div>

                        {/* COLORES */}
                        {colores.length > 0 && (
                            <div className="mt-8">
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">
                                    Color
                                    {selectedAttrs.color && (
                                        <span className="ml-2 text-neutral-900">
                                            {selectedAttrs.color}
                                        </span>
                                    )}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {colores.map(color => {
                                        const activo =
                                            selectedAttrs.color?.toLowerCase() ===
                                            color.nombre.toLowerCase();
                                        const disponible = isAttributeAvailable( "color", color.nombre);
                                        return (
                                            <button
                                                key={color.nombre}
                                                disabled={!disponible}
                                                onClick={() => handleAttrChange("color", color.nombre)}
                                                title={color.nombre}
                                                className={`w-9 h-9 rounded-full border-2 transition-all ${
                                                    activo
                                                    ? "border-black scale-110 shadow-md"
                                                    : disponible
                                                        ? "border-neutral-200 hover:scale-105"
                                                        : "border-neutral-200 opacity-30 grayscale cursor-not-allowed"
                                                }`}
                                                style={{
                                                    backgroundColor:
                                                        color.hex || "#E0E0E0"
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ATRIBUTOS */}
                        {Object.entries(attributeOptions).map(([nombre, valores]) => (
                            <div key={nombre} className="mt-8">
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">
                                    {nombre}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {valores.map(valor => {
                                        const activo = selectedAttrs[nombre] === valor;
                                        const disponible = isAttributeAvailable(nombre, valor);
                                        return (
                                            <button
                                                key={valor}
                                                type="button"
                                                disabled={!disponible}
                                                onClick={() =>
                                                    handleAttrChange(nombre, valor)
                                                }
                                                className={` px-5 py-3 rounded-full text-sm font-bold border transition
                                                    ${
                                                        activo
                                                            ? "bg-black text-white border-black"
                                                            : disponible
                                                                ? "bg-white border-neutral-200 hover:border-black"
                                                                : "bg-neutral-100 text-neutral-300 border-neutral-100 cursor-not-allowed"
                                                    }
                                                `}
                                            >
                                                {valor}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                            {/* DETALLE */}
                        {product.detalle && (
                            <div className="mt-8 pt-8 border-t border-neutral-100">
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                                    Detalle
                                </p>
                                <p className="text-neutral-600 leading-relaxed">
                                    {product.detalle}
                                </p>
                            </div>
                        )}

                        {/* STOCK */}
                        <div className="mt-8">
                            <p className="text-sm text-neutral-500">
                                {stockActual > 0
                                    ? `${stockActual} unidades disponibles`
                                    : "Sin stock"}
                            </p>
                        </div>

                        {/* AGREGAR AL CARRITO */}
                        {/* Selector de Cantidad */}
                        {stockActual > 0 && (
                            <div className="flex items-center gap-4 mt-6">
                                <span className="text-sm uppercase tracking-widest text-neutral-400">
                                    Cantidad
                                </span>
                                <div className="flex items-center border border-neutral-200 rounded-full overflow-hidden">
                                    <button
                                        onClick={decreaseQty}
                                        disabled={botonDeshabilitado}
                                        className={`w-12 h-12 transition
                                            ${
                                                puedeEliminar
                                                    ? "text-neutral-500 hover:bg-red-50 hover:text-red-500"
                                                    : botonDeshabilitado
                                                        ? "text-neutral-300 cursor-not-allowed"
                                                        : "hover:bg-neutral-100"
                                            }
                                        `}
                                    >
                                        {puedeEliminar ? "🗑️" : "−"}
                                    </button>
                                    <span className="w-12 text-center font-bold">
                                        {qty}
                                    </span>
                                    <button
                                        onClick={increaseQty}
                                        disabled={qty >= stockActual}
                                        className={`w-12 h-12 transition ${
                                            qty >= stockActual
                                                ? "text-neutral-300 cursor-not-allowed"
                                                : "hover:bg-neutral-100"
                                        }`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Contenedor del Botón + Cartel de Advertencia */}
                        <div className="relative mt-8 w-full">
                        <AnimatePresence>
                            {cartAdded && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12, scale: 0.95}}
                                    animate={{opacity: 1,y: 0,scale: 1}}
                                    exit={{opacity: 0,y: 8,scale: 0.95}}
                                    transition={{type: "spring",stiffness: 400,damping: 25}}
                                    className=" absolute left-0 right-0 bottom-full mb-4 z-[999] flex 
                                                justify-center pointer-events-none"
                                >
                                    <div className=" relative w-max max-w-[320px] bg-white border 
                                                    border-emerald-100 rounded-2xl shadow-2xl px-5 py-4 "
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className=" flex items-center justify-center w-8 h-8 rounded-full
                                                            bg-emerald-50 text-emerald-500 font-bold text-lg">
                                                ✓
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-neutral-900">
                                                    {cartAction === "modified"
                                                        ? "Producto modificado"
                                                        : cartAction === "removed"
                                                            ? "Producto eliminado"
                                                            : "Producto agregado"
                                                    }
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                    {cartAction === "modified"
                                                        ? "Los cambios se guardaron correctamente."
                                                        : cartAction === "removed"
                                                            ? "Se quitó de tu carrito."
                                                            : "Ya está en tu carrito."
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        {/* COLITA DE LA BURBUJA */}
                                        <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white border-r 
                                                        border-b border-emerald-100 rotate-45"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <AnimatePresence>
                            {variantWarning && (
                                <motion.div
                                    initial={{opacity: 0,y: 12,scale: 0.95}}
                                    animate={{opacity: 1,y: 0,scale: 1}}
                                    exit={{opacity: 0,y: 8,scale: 0.95}}
                                    transition={{type: "spring",stiffness: 400,damping: 25}}
                                    className="absolute left-0 right-0 bottom-full mb-4 z-[999]
                                            flex justify-center pointer-events-no"
                                >
                                    <div className=" relative w-max max-w-[320px] bg-white border 
                                                    border-neutral-200 rounded-2xl shadow-2xl px-5 py-4 "
                                    >
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-neutral-900">
                                                Por favor, seleccioná:
                                            </p>
                                            <ul className="mt-2 space-y-1 text-sm text-neutral-600">
                                                {variantWarning.map((atributo, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span className="text-amber-500 font-black ">
                                                            •
                                                        </span>

                                                        <span>
                                                            {atributo}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {/* COLITA DE LA BURBUJA*/}
                                        <div className=" absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white border-r 
                                                        border-b border-neutral-200 rotate-45 "
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <button
                            onClick={handleAdd}
                            disabled={stockActual <= 0}
                            className={`w-full rounded-full py-5 font-bold text-lg transition
                                ${
                                    stockActual <= 0
                                        ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                        : "bg-black text-white hover:scale-[1.02] active:scale-[0.98]"
                                }
                            `}
                        >
                            {estaEnCarrito ? "Modificar" : "Agregar al carrito"}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
);
}