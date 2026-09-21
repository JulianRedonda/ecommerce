import { useMemo } from "react";

import {motion,AnimatePresence} from "framer-motion";

export default function CatalogoMenu({
    isOpen,
    onClose,
    products,
    menuRubro,
    menuCategoria,
    menuSubcategoria,
    setMenuRubro,
    setMenuCategoria,
    setMenuSubcategoria,
    irA,
    onNavigateToProducts
}) {
const rubros = useMemo(() => {
    return [
        ...new Set(
            products
                .flatMap(product => product.rubros || [])
                .map(rubro => rubro.trim())
                .filter(Boolean)
        )
    ].sort();
}, [products]);

const categorias = useMemo(() => {
    if (menuRubro === "All") {
        return [];
    }
    return [
        ...new Set(
            products
                .filter(product =>
                    (product.rubros || []).includes(menuRubro)
                )
                .flatMap(product => product.categorias || [])
                .map(categoria => categoria.trim())
                .filter(Boolean)
        )
    ].sort();
}, [products, menuRubro]);

const subcategorias = useMemo(() => {
    if (
        menuRubro === "All" ||
        menuCategoria === "All"
    ) {
        return [];
    }
    return [
        ...new Set(
            products
                .filter(product =>
                    (product.rubros || []).includes(menuRubro) &&
                    (product.categorias || []).includes(menuCategoria)
                )
                .flatMap(product => product.subcategorias || [])
                .map(subcategoria => subcategoria.trim())
                .filter(Boolean)
        )
    ].sort();
}, [products,menuRubro,menuCategoria]);

const contarProductos = (campo, valor, filtros = {}) => {
    return products.filter(product => {
        if (
            campo &&
            !(product[campo] || []).includes(valor)
        ) {
            return false;
        }
        if (
            filtros.rubro &&
            !(product.rubros || []).includes(filtros.rubro)
        ) {
            return false;
        }
        if (
            filtros.categoria &&
            !(product.categorias || []).includes(filtros.categoria)
        ) {
            return false;
        }
        if (
            filtros.subcategoria &&
            !(product.subcategorias || []).includes(filtros.subcategoria)
        ) {
            return false;
        }
        return true;
    }).length;
};
const seleccionarRubro = (rubro) => {
    setMenuRubro(rubro);
    setMenuCategoria("All");
    setMenuSubcategoria("All");
};
const seleccionarCategoria = (categoria) => {
    setMenuCategoria(categoria);
    setMenuSubcategoria("All");
};
const seleccionarSubcategoria = (subcategoria) => {
    setMenuSubcategoria(subcategoria);
    irA({
        rubro: menuRubro,
        categoria: menuCategoria,
        subcategoria
    });
    onClose();
    onNavigateToProducts();
};
const verTodoRubro = () => {
    irA({rubro: menuRubro});
    onClose();
    onNavigateToProducts();
};
const verTodoCategoria = () => {
    irA({
        rubro: menuRubro,
        categoria: menuCategoria
    });
    onClose();
    onNavigateToProducts();
};
if (!isOpen) {
    return null;
}
return (
    <AnimatePresence>
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center
                        p-4 bg-black/40 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
            <motion.div
                initial={{opacity: 0,y: -20,scale: 0.98}}
                animate={{opacity: 1,y: 0,scale: 1}}
                exit={{opacity: 0,y: -20,scale: 0.98}}
                transition={{duration: 0.25,ease: "easeOut"}}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-6xl max-h-[calc(100vh-32px)] overflow-hidden bg-white
                            rounded-[28px] shadow-2xl border border-neutral-100"
                >

                    {/* HEADER */}
                    <div className="flex items-center justify-between px-7 py-5 border-b border-neutral-100">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                                Explorar
                            </p>
                            <h2 className="mt-1 text-xl font-semibold tracking-tight">
                                Catálogo
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-full 
                                        bg-neutral-100 hover:bg-neutral-200 transition"
                            aria-label="Cerrar catálogo"
                        >
                            <i data-lucide="x"
                                className="w-4 h-4"
                            ></i>
                        </button>
                </div>

                {/* BREADCRUMB */}
                {(menuRubro !== "All") && (
                    <div className="px-7 pt-5 flex items-center gap-2 text-xs">
                        <button
                            onClick={() => {setMenuRubro("All");
                                            setMenuCategoria("All");
                                            setMenuSubcategoria("All");
                            }}
                            className="text-neutral-400 hover:text-black transition"
                        >
                            Rubros
                        </button>
                        <span className="text-neutral-300">
                            /
                        </span>
                        <span className="font-medium">
                            {menuRubro}
                        </span>
                        {menuCategoria !== "All" && (
                                <>
                                <span className="text-neutral-300">
                                    /
                                </span>
                                <span className="font-medium">
                                    {menuCategoria}
                                </span>
                            </>
                        )}
                        {menuSubcategoria !== "All" && (
                            <>
                                <span className="text-neutral-300">
                                    /
                                </span>
                                <span className="font-medium">
                                    {menuSubcategoria}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {/* CONTENIDO */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x
                                divide-neutral-100 max-h-[calc(100vh-230px)] overflow-y-auto">

                    {/* RUBROS */}
                    <div className="p-7">
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                                Rubros
                            </p>
                        </div>
                        <div className="space-y-1">
                            {rubros.map(rubro => {
                                const cantidad = contarProductos("rubros",rubro);
                                const seleccionado = menuRubro === rubro;
                                return (
                                    <button
                                        key={rubro}
                                        onClick={() => seleccionarRubro(rubro)}
                                        className={`group w-full flex items-center justify-between 
                                                    px-3 py-2.5 rounded-xl text-left transition-all
                                            ${
                                                seleccionado
                                                    ? "bg-neutral-900 text-white"
                                                    : "hover:bg-neutral-100"
                                            }
                                        `}
                                    >
                                        <span className="text-sm font-medium">
                                            {rubro}
                                        </span>

                                        <span className={`text-xs
                                            ${
                                                seleccionado
                                                    ? "text-white/50"
                                                    : "text-neutral-400"
                                            }
                                        `}>
                                            {cantidad}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* CATEGORÍAS */}
                    <div className="p-7">
                        {menuRubro === "All" ? (
                            <div className="h-full min-h-[250px] flex items-center justify-center text-center">
                                <div>
                                    <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-neutral-100 flex 
                                                    items-center justify-center">
                                        <i 
                                            data-lucide="arrow-left"
                                            className="w-4 h-4 text-neutral-400"
                                        ></i>
                                    </div>
                                    <p className="text-sm font-medium">
                                        Elegí un rubro
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-400">
                                        para ver sus categorías
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">                                            Categorías
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    {categorias.map(categoria => {
                                        const cantidad = contarProductos( "categorias", categoria,
                                                            {
                                                                rubro: menuRubro
                                                            }
                                                        );
                                        const seleccionado = menuCategoria === categoria;
                                        return (
                                            <button
                                                key={categoria}
                                                onClick={() => seleccionarCategoria(categoria)}
                                                className={`group w-full flex items-center justify-between 
                                                            px-3 py-2.5 rounded-xl text-left transition-all
                                                    ${
                                                        seleccionado
                                                            ? "bg-neutral-900 text-white"
                                                            : "hover:bg-neutral-100"
                                                    }
                                                `}
                                            >
                                                <span className="text-sm font-medium">
                                                    {categoria}
                                                </span>
                                                <span className={`text-xs
                                                    ${
                                                        seleccionado
                                                            ? "text-white/50"
                                                            : "text-neutral-400"
                                                    }
                                                `}>
                                                    {cantidad}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* VER TODO */}
                                <button
                                    onClick={verTodoRubro}
                                    className="mt-5 pt-4 border-t border-neutral-100 w-full flex items-center
                                                justify-between text-sm font-medium hover:text-neutral-500 transition"
                                >
                                    <span>
                                        Ver todo {menuRubro}
                                    </span>
                                    <i
                                        data-lucide="arrow-right"
                                        className="w-4 h-4"
                                    ></i>
                                </button>
                            </>
                        )}
                    </div>

                    {/* SUBCATEGORÍAS */}
                    <div className="p-7">
                        {menuCategoria === "All" ? (
                            <div className="h-full min-h-[250px] flex items-center justify-center text-center">                                    <div>
                                    <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-neutral-100 flex 
                                                    items-center justify-center">
                                        <i
                                            data-lucide="arrow-left"
                                            className="w-4 h-4 text-neutral-400"
                                        ></i>
                                    </div>
                                    <p className="text-sm font-medium">
                                        Elegí una categoría
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-400">
                                        para ver sus subcategorías
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                                        Subcategorías
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    {subcategorias.map(subcategoria => {
                                        const cantidad = contarProductos("subcategorias",subcategoria,
                                                            {
                                                                rubro: menuRubro,
                                                                categoria: menuCategoria
                                                            }
                                                        );
                                        const seleccionado = menuSubcategoria === subcategoria;
                                        return (
                                            <button
                                                key={subcategoria}
                                                onClick={() => seleccionarSubcategoria(subcategoria)}
                                                className={`group w-full flex items-center justify-between px-3 
                                                            py-2.5 rounded-xl text-left transition-all
                                                    ${
                                                        seleccionado
                                                            ? "bg-neutral-900 text-white"
                                                            : "hover:bg-neutral-100"
                                                    }
                                                `}
                                            >
                                                <span className="text-sm font-medium">
                                                    {subcategoria}
                                                </span>
                                                <span className={`text-xs
                                                    ${
                                                        seleccionado
                                                            ? "text-white/50"
                                                            : "text-neutral-400"
                                                    }
                                                `}>
                                                    {cantidad}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* VER TODO */}
                                <button
                                    onClick={verTodoCategoria}
                                    className="mt-5 pt-4 border-t border-neutral-100 w-full flex items-center
                                                justify-between text-sm font-medium hover:text-neutral-500 transition"
                                >
                                    <span>
                                        Ver todo {menuCategoria}
                                    </span>

                                    <i
                                        data-lucide="arrow-right"
                                        className="w-4 h-4"
                                    ></i>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    </AnimatePresence>
);
}