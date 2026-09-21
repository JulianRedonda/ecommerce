import {useState,useMemo,useEffect,useRef} from "react";

import { AnimatePresence } from "framer-motion";
import { buildHash,parseHash } from "./utils/catalog.js";
import { createIcons } from "lucide";

import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import CatalogoMenu from "../components/CatalogoMenu.jsx";
import SearchBar from "../components/SearchBar.jsx";
import VariantFilters from "../components/VariantFilters.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import ProductDetail from "../components/ProductDetail.jsx";
import Cart from "../components/Cart.jsx";
import Footer from "../components/Footer.jsx";

export default function App() {

    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    useEffect(() => {
        if (!isCatalogOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsCatalogOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isCatalogOpen]);

    const [menuRubro, setMenuRubro] = useState("All");
    const [menuCategoria, setMenuCategoria] = useState("All");
    const [menuSubcategoria, setMenuSubcategoria] = useState("All");
    const [activeRubro, setActiveRubro] = useState("All");
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [variantFilters, setVariantFilters] = useState({});
    const [priceFilterTouched, setPriceFilterTouched] = useState(false);
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });
    const [priceRange, setPriceRange] = useState({
        min: null,
        max: null
    });
    const [itemsPerPage, setItemsPerPage] = useState(18);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartAlerta, setCartAlerta] = useState(false);
    const cartAlertaVisto = useRef(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchScope, setSearchScope] = useState("all");
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeSubcategory, setActiveSubcategory] = useState("All");
    const [qtyWarning, setQtyWarning] = useState(null);
    const [itemAEliminar, setItemAEliminar] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    useEffect(() => {
        fetch("/public/productos.json")
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                const parsed = parseHash(data);
                setActiveRubro(parsed.rubro);
                setActiveCategory(parsed.categoria);
                setActiveSubcategory(parsed.subcategoria);
                if (parsed.codigo) {
                    setSelectedProduct(data.find(p => String(p.codigo) === String(parsed.codigo)) || null);
                }
            })
        .catch(error => {console.error("Error cargando productos:", error);})
        .finally(() => {setIsLoading(false);});
    }, []);

    useEffect(() => {
        if (isCatalogOpen) {
            setMenuRubro("All");
            setMenuCategoria("All");
            setMenuSubcategoria("All");
        }
    }, [isCatalogOpen]);

    useEffect(() => {
        if (isLoading) return;
        setCart(prev => {
            let changed = false;
            const next = prev.map(item => {
                const encontrado = buscarVarianteCatalogo(item.sku);
                if (!encontrado) {
                    if (item.disponibilidad !== "retirado") changed = true;
                    return { ...item, disponibilidad: "retirado", stock: 0 };
                }
                const stock = Number(encontrado.variante.stock || 0);
                const precio = Number(encontrado.variante.precio_min || 0);
                const qtyActual = Number(item.qty) || 1;
                if (stock <= 0) {
                    if (item.disponibilidad !== "sin_stock") changed = true;
                    return {
                        ...item,
                        disponibilidad: "sin_stock",
                        stock: 0,
                        precioSeleccionado: precio
                    };
                }
                const qty = Math.min(qtyActual, stock);
                const disponibilidad = qty < qtyActual ? "stock_ajustado" : "ok";
                const reconciled = {
                    ...item,
                    disponibilidad,
                    stock,
                    qty,
                    precioSeleccionado: precio
                };
                if (
                    item.disponibilidad !== disponibilidad ||
                    item.stock !== stock ||
                    item.qty !== qty ||
                    item.precioSeleccionado !== precio
                ) {
                changed = true;
                }
            return reconciled;
            });
            const hayCambios = next.some(item =>
                item.disponibilidad === "retirado" ||
                item.disponibilidad === "sin_stock" ||
                item.disponibilidad === "stock_ajustado"
            );
            if (hayCambios && !cartAlertaVisto.current) {
                setCartAlerta(true);
            } else if (!hayCambios) {
                setCartAlerta(false);
            }
            return changed ? next : prev;
        });
    }, [products, isLoading]);

    const variantFilterOptions = useMemo(() => {
        const opciones = {};
        const productosDisponibles = products.filter(product => {
            const coincideRubro =
                !activeRubro ||
                activeRubro === "All" ||
                (product.rubros || []).includes(activeRubro);
            const coincideCategoria =
                !activeCategory ||
                activeCategory === "All" ||
                (product.categorias || []).includes(activeCategory);
            const coincideSubcategoria =
                !activeSubcategory ||
                activeSubcategory === "All" ||
                (product.subcategorias || []).includes(activeSubcategory);
            return (coincideRubro && coincideCategoria && coincideSubcategoria);
        });
        // ATRIBUTOS DE ESOS PRODUCTOS
        productosDisponibles.forEach(product => {
            (product.variantes || []).forEach(variante => {
                const atributos = variante.atributos || {};
                Object.entries(atributos).forEach(
                    ([nombre, valor]) => {
                        if (!valor) return;
                        if (nombre === "color") {
                            const colorNombre =
                                valor?.nombre;
                            if (!colorNombre) return;
                            if (!opciones.color) {
                                opciones.color = [];
                            }
                            if (
                                !opciones.color.some(
                                    color =>
                                        color.toLowerCase() ===
                                        colorNombre.toLowerCase()
                                )
                            ) {
                            opciones.color.push(colorNombre);
                            }
                            return;
                        }
                        if (!opciones[nombre]) {
                            opciones[nombre] = [];
                        }
                        if (
                            !opciones[nombre].some(
                                existente =>
                                    String(existente).toLowerCase() ===
                                    String(valor).toLowerCase()
                            )
                        ) {
                            opciones[nombre].push(valor);
                        }
                    }
                );
                // ESTADO
                if (variante.estado) {
                    if (!opciones.estado) {
                        opciones.estado = [];
                    }
                    if (
                        !opciones.estado.some(
                            estado =>
                                estado.toLowerCase() ===
                                variante.estado.toLowerCase()
                        )
                    ) {
                        opciones.estado.push(variante.estado);
                    }
                }
            });
        });
        // ORDEN
        Object.keys(opciones).forEach(nombre => {
            opciones[nombre].sort((a, b) =>
                String(a).localeCompare(
                    String(b),
                    undefined,
                    { numeric: true }
                )
            );
        });
        return opciones;
    }, [products,activeRubro,activeCategory,activeSubcategory]);

    const varianteCoincideFiltros = (variante, filtros, ignorarFiltro = null) => {
        const atributos = variante.atributos || {};
        return Object.entries(filtros).every(([nombre, valor]) => {
            if (nombre === ignorarFiltro) {
                return true;
            }
            if (!valor) {
                return true;
            }
            if (nombre === "color") {
                return (
                    atributos.color?.nombre?.toLowerCase() ===
                    valor.toLowerCase()
                );
            }
                if (nombre === "estado") {
                return (
                    String(variante.estado || "").toLowerCase() ===
                    String(valor).toLowerCase()
                );
            }
            return String(atributos[nombre] || "").toLowerCase() ===
                String(valor).toLowerCase();
        });
    };

    const priceLimits = useMemo(() => {
        const precios = products.flatMap(product => {
            // RUBRO / CATEGORÍA / SUBCATEGORÍA
            if (
                activeRubro !== "All" &&
                !(product.rubros || []).includes(activeRubro)
            ) {
                return [];
            }
            if (
                activeCategory !== "All" &&
                !(product.categorias || []).includes(activeCategory)
            ) {
                return [];
            }
            if (
                activeSubcategory !== "All" &&
                !(product.subcategorias || []).includes(activeSubcategory)
            ) {
                return [];
            }
            // VARIANTES QUE CUMPLEN LOS FILTROS
            return (product.variantes || [])
            .filter(variante =>varianteCoincideFiltros(variante,variantFilters))
                .map(variante =>Number(variante.precio_min))
                .filter(precio =>Number.isFinite(precio));
        });
        // SIN PRECIOS
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
    }, [products,activeRubro,activeCategory,activeSubcategory,variantFilters]);

    useEffect(() => {
        setPriceRange({
            min: priceLimits.min,
            max: priceLimits.max
        });
    }, [priceLimits.min, priceLimits.max]);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        setVariantFilters({});
    }, [activeRubro,activeCategory,activeSubcategory]);

    const resetFilters = () => {
        setSearchTerm("");
        setActiveRubro("All");
        setActiveCategory("All");
        setActiveSubcategory("All");
    };

    const varianteCoincidePrecio = (variante) => {
        const precio = Number(variante.precio_min || 0);
        return (
            precio >= priceRange.min &&
            precio <= priceRange.max
        );
    };
    const rangoPrecioListo =
        Number.isFinite(priceRange.min) &&
        Number.isFinite(priceRange.max) &&
        priceRange.max >= priceLimits.min &&
        priceRange.min <= priceLimits.max;

    const precioFiltrado =
        rangoPrecioListo &&
        (
            priceRange.min > priceLimits.min ||
            priceRange.max < priceLimits.max
        );
    // FILTRO DE DISPONIBILIDAD DE OPCIONES
    const isFilterOptionAvailable = (
        nombreFiltro,
        valor
    ) => {
        const filtrosSinEste = {
            ...variantFilters
        };
        delete filtrosSinEste[nombreFiltro];
        let productosContexto = products;
        if (activeRubro !== "All") {
            productosContexto = productosContexto.filter(product =>
                (product.rubros || []).includes(activeRubro)
            );
        }
        if (activeCategory !== "All") {
            productosContexto = productosContexto.filter(product =>
                (product.categorias || []).includes(activeCategory)
            );
        }
        if (activeSubcategory !== "All") {
            productosContexto = productosContexto.filter(product =>
                (product.subcategorias || []).includes(activeSubcategory)
            );
        }
        return productosContexto.some(product => {
            const variantes = product.variantes || [];
            return variantes.some(variante => {
                if (
                    !varianteCoincideFiltros(
                        variante,
                        filtrosSinEste
                    )
                ) {
                    return false;
                }
                const atributos = variante.atributos || {};
                if (nombreFiltro === "color") {
                    return (
                        atributos.color?.nombre?.toLowerCase() ===
                        String(valor).toLowerCase()
                    );
                }
                if (nombreFiltro === "estado") {
                    return (
                        String(variante.estado || "").toLowerCase() ===
                        String(valor).toLowerCase()
                    );
                }
                return String(
                    atributos[nombreFiltro] || ""
                ).toLowerCase() ===
                    String(valor).toLowerCase();
            });
        });
    };

    const filteredProducts = useMemo(() => {
        let result = products;
        // RUBRO
        if (activeRubro !== "All") {
            result = result.filter(p => (p.rubros || []).includes(activeRubro));
        }
        // CATEGORÍA
        if (activeCategory !== "All") {
            result = result.filter(p => (p.categorias || []).includes(activeCategory));
        }
        // SUBCATEGORÍA
        if (activeSubcategory !== "All") {
            result = result.filter(p => (p.subcategorias || []).includes(activeSubcategory));
        }
        // FILTROS DE VARIANTES + PRECIO
        if (
            Object.keys(variantFilters).length > 0 ||
            precioFiltrado
        ) {
            result = result.filter(product => {
                const variantes = product.variantes || [];
                return variantes.some(variante => {
                    const coincideFiltros =
                    varianteCoincideFiltros(variante,variantFilters);
                if (!coincideFiltros) {
                    return false;
                }
                const precio = Number(variante.precio_min || 0);
                return (precio >= priceRange.min && precio <= priceRange.max);
                });
            });
        }

        // BUSCADOR
        if (searchTerm.trim() !== "") {
            const term = searchTerm.trim().toLowerCase();
            result = result.filter(product => {
                const fields = {
                descripcion:String(product.descripcion || "").toLowerCase(),
                codigo:String(product.codigo || "").toLowerCase(),
                marca:String(product.marca || "").toLowerCase(),
                detalle:String(product.detalle || "").toLowerCase(),
                sku:(product.variantes || [])
                    .map(v => v.sku || "")
                    .join(" ")
                    .toLowerCase()
                };
                if (searchScope === "all") {
                    return Object.values(fields)
                                    .some(value =>
                                    value.includes(term)
                    );
                }
                return fields[searchScope]
                    ?.includes(term);
            });
        }
        return result;
    }, [
        products,
        activeRubro,
        activeCategory,
        activeSubcategory,
        variantFilters,
        searchTerm,
        searchScope,
        priceRange,
        precioFiltrado
    ]);

    useEffect(() => {
        if (window.lucide) {
            createIcons();
        }
    }, [isLoading,cart,selectedProduct, filteredProducts,isCatalogOpen]);

    const totalPages = itemsPerPage === "all"
                            ? 1
                            : Math.ceil(filteredProducts.length / itemsPerPage);

    const paginatedProducts = useMemo(() => {
        if (itemsPerPage === "all") {
            return filteredProducts;
        }
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredProducts.slice(start, end);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [activeRubro, activeCategory, activeSubcategory, searchTerm, searchScope]);

    const getPaginationPages = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }
        pages.push(1);
        if (currentPage > 4) {
            pages.push("...");
        }
        const start = Math.max(2, currentPage - 2);
        const end = Math.min(totalPages - 1, currentPage + 2);
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 3) {
            pages.push("...");
        }
        pages.push(totalPages);
        return pages;
    };

    const productsSectionRef = useRef(null);
    const navbarRef = useRef(null);

    useEffect(() => {
        if (productsSectionRef.current) {
            productsSectionRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }, [currentPage]);

    const handleScrollToProducts = () => {
        setTimeout(() => {
            const element = productsSectionRef.current;
            const navbar = navbarRef.current;
            if (!element) return;
            const navbarHeight = navbar?.getBoundingClientRect().height || 0;
            const position =
                element.getBoundingClientRect().top +
                window.scrollY -
                navbarHeight;
            window.scrollTo({
                top: position,
                behavior: "smooth"
            });
        }, 400);
    };

    // --- LOGICA DEL CARRITO ---
    const buscarVarianteCatalogo = (sku) => {
        for (const product of products) {
            const variante = (product.variantes || []).find(
                v => String(v.sku) === String(sku)
            );
            if (variante) return { product, variante };
        }
        return null;
    };

    const addToCart = (
    product,
    quantity = 1,
    { modificar = false } = {}
    ) => {
    const cantidad = Math.max(1, Number(quantity) || 1);
    setCart(prev => {
        const existing = prev.find(
            item => item.sku === product.sku
        );
        if (modificar && existing) {
            return prev.map(item =>
                item.sku === product.sku
                    ? {
                        ...item,
                        qty: cantidad
                    }
                    : item
            );
        }
        return [
                ...prev,
                {
                    ...product,
                    qty: cantidad
                }
        ];
    });
    };

    const removeFromCart = (sku) => {
    setCart(prev =>
        prev.filter(item => item.sku !== sku)
    );
    };

    const updateCartQuantity = (product, quantity) => {
    setCart(prev =>
        prev.map(item =>
            item.sku === product.sku
                ? {
                    ...item,
                    qty: quantity
                }
                : item
        )
    );
    };

    const handleAddFromCatalog = (product) => {
    addToCart(product);
    setIsCartOpen(true);
    };

    const increaseQty = (sku) => {
    setCart(prev =>
        prev.map(item => {
            if (item.sku === sku) {
                if (
                    item.disponibilidad === "retirado" ||
                    item.disponibilidad === "sin_stock"
                ) {
                    return item;
                }
                if (Number(item.qty) >= item.stock) {
                    setQtyWarning(sku);
                    setTimeout(() => setQtyWarning(null), 1500);
                    return item;
                }
                return { ...item, qty: Number(item.qty) + 1 };
            }
            return item;
        })
    );
    };

    const decreaseQty = (sku) => {
    setCart(prev => prev.map(item => {
        if (item.sku === sku) {
            if (
                item.disponibilidad === "retirado" ||
                item.disponibilidad === "sin_stock"
            ) {
                return item;
            }
            if (item.qty > 1) {
                return { ...item, qty: item.qty - 1 };
            } else {
                // Si es 1, abrimos la confirmación lateral derecha
                setItemAEliminar(sku);
            }
        }
        return item;
    }));
    };

    const handleKeyDown = (e, sku) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") {
    return;
    }   
    e.preventDefault();
    setCart(prev =>
    prev.map(item => {
        if (item.sku !== sku) return item;
        if (
        item.disponibilidad === "retirado" ||
        item.disponibilidad === "sin_stock"
        ) {
        return item;
        }
        const current = parseInt(item.qty, 10) || 1;
        return {
            ...item,
            qty: e.key === "ArrowUp"
                ? Math.min(current + 1, Number(item.stock))
                : Math.max(current - 1, 1)
        };
    })
    );
    }; 

    const handleQtyInput = (sku, value) => {
    setCart(prev =>
    prev.map(item => {
        if (item.sku !== sku) return item;
        if (
            item.disponibilidad === "retirado" ||
            item.disponibilidad === "sin_stock"
        ) {
        return item;
        }
        if (value === "") {
            return { ...item, qty: "" };
        }
        const cantidad = Number(value);
        if (isNaN(cantidad)) return item;
        const stockDisponible = Number(item.stock || 0);
        return {
            ...item,
            qty: Math.min(
                Math.max(cantidad, 1),
                stockDisponible
            )
        };
    })
    );
    };

    const getPrecioActual = (item) => {
    const varianteActual = products
    .flatMap(product => product.variantes || [])
    .find(variante => variante.sku === item.sku);
    return Number(
    varianteActual?.precio_min ??
    item.precioSeleccionado ??
    0
    );
    };

    const removeItem = (sku) => {
    setCart(prev => prev.filter(item => item.sku !== sku));
    setItemAEliminar(null);
    };

    const itemComprable = (item) => item.disponibilidad !== "retirado" && item.disponibilidad !== "sin_stock";

    const total = cart.reduce((acc, item) => {
    if (!itemComprable(item)) return acc;
    return acc + getPrecioActual(item) * Number(item.qty || 0);
    }, 0);

    const hayNoDisponibles = cart.some(
    item =>
    item.disponibilidad === "retirado" ||
    item.disponibilidad === "sin_stock"
    );

    const abrirCarrito = () => {
    setIsCartOpen(true);
    setCartAlerta(false);
    cartAlertaVisto.current = true
    };

    const sendWhatsApp = () => {
    const phoneNumber = "5491162873764"; 
    const itemsList = cart
    .filter(itemComprable)
    .map(item => `...`)
    .join("\n");
    const message = `¡Hola Vanna Comfy! 👋\n\nQuiero realizar el siguiente pedido:\n\n${itemsList}\n\n*TOTAL: $${total}*`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    const ignorarHash = useRef(false);

    const irA = (destino, { replace = false } = {}) => {
    const hash = buildHash(destino);
    ignorarHash.current = true;
    if (replace) history.replaceState(null, "", hash);
    else history.pushState(null, "", hash);
    setActiveRubro(destino.rubro || "All");
    setActiveCategory(destino.categoria || "All");
    setActiveSubcategory(destino.subcategoria || "All");
    setCurrentPage(1);
    setVariantFilters({});
    if (destino.codigo) {
        const producto = products.find(p => String(p.codigo) === String(destino.codigo));
        setSelectedProduct(producto || null);
    } else {
        setSelectedProduct(null);
    }
    };

    const trailDelProducto = (product, ctx, catalogo) => {
    const rubros = product.rubros || [];
    const cats = product.categorias || [];
    const subs = product.subcategorias || [];
    const rubro = ctx.activeRubro !== "All" && rubros.includes(ctx.activeRubro)
                    ? ctx.activeRubro
                    : rubros[0];
    const categoria = ctx.activeCategory !== "All" && cats.includes(ctx.activeCategory)
                        ? ctx.activeCategory
                        : cats[0];
    let subcategoria;
    if (ctx.activeSubcategory !== "All" && subs.includes(ctx.activeSubcategory)) {
        subcategoria = ctx.activeSubcategory;
    } else if (cats.length && cats.length === subs.length) {
        const i = Math.max(0, cats.indexOf(categoria));
        subcategoria = subs[i];
    } else {
        const usadas = catalogo
            .filter(p => (p.categorias || []).includes(categoria))
            .flatMap(p => p.subcategorias || []);
        subcategoria =
            subs.find(s => usadas.includes(s)) ||
            subs[0];
    }
    return { rubro, categoria, subcategoria };
    };

    useEffect(() => {
    const onHash = () => {
        if (ignorarHash.current) {
            ignorarHash.current = false;
            return;
        }
        if (!products.length) return;
        const parsed = parseHash(products);
        setActiveRubro(parsed.rubro);
        setActiveCategory(parsed.categoria);
        setActiveSubcategory(parsed.subcategoria);
        if (parsed.codigo) {
            const producto = products.find(
                p => String(p.codigo) === String(parsed.codigo)
            );
            setSelectedProduct(producto || null);
        } else {
            setSelectedProduct(null);
        }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    }, [products]);

    return (
        
        <div className="min-h-screen bg-[#f8f8f8] text-slate-900 overflow-x-hidden">
            
            <Navbar
                cart={cart}
                setIsCartOpen={abrirCarrito}
                setCartAlerta={setCartAlerta}
                cartAlerta={cartAlerta}
                navbarRef={navbarRef}
                isCatalogOpen={isCatalogOpen}
                setIsCatalogOpen={setIsCatalogOpen}
            />

            <Hero />

            <CatalogoMenu
                isOpen={isCatalogOpen}
                onClose={() => setIsCatalogOpen(false)}
                products={products}
                menuRubro={menuRubro}
                menuCategoria={menuCategoria}
                menuSubcategoria={menuSubcategoria}
                setMenuRubro={setMenuRubro}
                setMenuCategoria={setMenuCategoria}
                setMenuSubcategoria={setMenuSubcategoria}
                irA={irA}
                onNavigateToProducts={handleScrollToProducts}
            />

            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchScope={searchScope}
                setSearchScope={setSearchScope}
                onSearch={handleScrollToProducts}
            />
            
            <VariantFilters
                options={variantFilterOptions}
                filters={variantFilters}
                setFilters={setVariantFilters}
                isOptionAvailable={isFilterOptionAvailable}
                priceLimits={priceLimits}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
            />

            <div ref={productsSectionRef} className="max-w-7xl mx-auto px-8 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                {/* Cantidad de resultados */}
                <p className="text-sm text-neutral-400">
                    <span className="font-bold text-neutral-700">
                        {filteredProducts.length}
                    </span>{" "}
                    {filteredProducts.length === 1 ? "producto" : "productos"}
                </p>

                {/* Cantidad por página */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-400">
                        Mostrar:
                    </span>

                    {[6, 12, 18].map(option => (
                        <button
                            key={option}
                            onClick={() => {
                                setItemsPerPage(option);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-full font-semibold transition-all ${
                                itemsPerPage === option
                                    ? "bg-black text-white"
                                    : "bg-white text-neutral-400 hover:bg-neutral-100 hover:text-black"
                            }`}
                        >
                            {option}
                        </button>
                    ))}

                    <button
                        onClick={() => {
                            setItemsPerPage("all");
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded-full font-semibold transition-all ${
                            itemsPerPage === "all"
                                ? "bg-black text-white"
                                : "bg-white text-neutral-400 hover:bg-neutral-100 hover:text-black"
                        }`}
                    >
                        Todos
                    </button>
                </div>
            </div>

            <ProductGrid
                isLoading={isLoading}
                itemsPerPage={itemsPerPage}
                onResetFilters={resetFilters}
                filteredProducts={paginatedProducts}
                addToCart={addToCart}
                handleAddFromCatalog={handleAddFromCatalog}
                updateCartQuantity={updateCartQuantity}
                onSelectProduct={(product) => {
                                    irA({
                                        rubro: activeRubro,
                                        categoria: activeCategory,
                                        subcategoria: activeSubcategory,
                                        codigo: product.codigo
                                    });
                                }}
                searchTerm={searchTerm}
                cart={cart}
                setVariantFilters={setVariantFilters}
                variantFilters={variantFilters}
            />
            
            {totalPages > 1 && (
                <div className="max-w-7xl mx-auto px-8 py-12 flex items-center justify-center gap-2">

                    {/* Anterior */}
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-10 h-10 rounded-full flex items-center justify-center
                                text-neutral-500 transition-all
                                hover:bg-neutral-100 hover:text-black
                                disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <i data-lucide="chevron-left" className="w-5 h-5"></i>
                    </button>

                    {/* Números */}
                    {getPaginationPages().map((page, index) => (
                        page === "..." ? (
                            <span
                                key={`dots-${index}`}
                                className="w-10 h-10 flex items-center justify-center text-neutral-400"
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                                    currentPage === page
                                        ? "bg-black text-white shadow-md scale-105"
                                        : "text-neutral-400 hover:bg-neutral-100 hover:text-black"
                                }`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                    {/* Siguiente */}
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 rounded-full flex items-center justify-center
                                text-neutral-500 transition-all
                                hover:bg-neutral-100 hover:text-black
                                disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <i data-lucide="chevron-right" className="w-5 h-5"></i>
                    </button>

                </div>
            )}

            <AnimatePresence mode="wait">
                {selectedProduct && (
                    <ProductDetail
                        product={selectedProduct}
                        onClose={() => irA({
                            rubro: activeRubro,
                            categoria: activeCategory,
                            subcategoria: activeSubcategory
                        })}
                        onAddToCart={addToCart}
                        cart={cart}
                        removeFromCart={removeFromCart}
                        onNavigate={irA}
                        activeRubro={activeRubro}
                        activeCategory={activeCategory}
                        activeSubcategory={activeSubcategory}
                        products={products}
                        trailDelProducto={trailDelProducto}
                        />
                )}
            </AnimatePresence>

            {/* LATERAL DEL CARRITO COMPLETO */}
            <Cart
                isCartOpen={isCartOpen}
                setIsCartOpen={setIsCartOpen}
                cart={cart}
                getPrecioActual={getPrecioActual}
                decreaseQty={decreaseQty}
                increaseQty={increaseQty}
                handleQtyInput={handleQtyInput}
                handleKeyDown={handleKeyDown}
                removeItem={removeItem}
                itemAEliminar={itemAEliminar}
                setItemAEliminar={setItemAEliminar}
                hayNoDisponibles={hayNoDisponibles}
                qtyWarning={qtyWarning}
                total={total}
                sendWhatsApp={sendWhatsApp}
            />

            {/* FOOTER VANNA COMFY - FINAL VERSION */}
            <Footer />
        </div>
    );
}