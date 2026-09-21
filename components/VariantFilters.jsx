import {useState,useEffect} from "react";
import {motion,AnimatePresence} from "framer-motion";

export default function VariantFilters({
    options,
    filters,
    setFilters,
    isOptionAvailable,
    priceRange,
    setPriceRange,
    priceLimits
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeThumb, setActiveThumb] = useState(null);
    const [openFilters, setOpenFilters] = useState({});
    const [priceFilterTouched, setPriceFilterTouched] = useState(false);
    const [minInput, setMinInput] = useState(
        String(priceRange.min ?? "")
    );
    const [maxInput, setMaxInput] = useState(
        String(priceRange.max ?? "")
    );

    // PRECIO FILTRADO
    const precioFiltrado = priceFilterTouched && (
        priceRange.min !== priceLimits.min ||
        priceRange.max !== priceLimits.max
    );

    // CANTIDAD DE FILTROS ACTIVOS
    const filtrosActivos = Object.keys(filters).length + (precioFiltrado ? 1 : 0);

    // ABRIR / CERRAR FILTRO
    const toggleFilter = (nombre) => {
        setOpenFilters(prev => ({
            ...prev,
            [nombre]: !prev[nombre]
        }));
    };

    // CAMBIO DE FILTRO
    const handleFilterChange = (nombre, valor) => {
        setFilters(prev => {
            if (prev[nombre] === valor) {
                const nuevos = { ...prev };
                delete nuevos[nombre];
                return nuevos;
            }
            return {
                ...prev,
                [nombre]: valor
            };
        });
    };

    // SINCRONIZAR INPUT MIN
    useEffect(() => {
        setMinInput(String(priceRange.min ?? ""));
    }, [priceRange.min]);

    // SINCRONIZAR INPUT MAX
    useEffect(() => {
        setMaxInput(String(priceRange.max ?? ""));
    }, [priceRange.max]);

    //ICONOS LUCIDE
    useEffect(() => {
        if (!window.lucide) return;
        requestAnimationFrame(() => {
            window.lucide.createIcons();
        });
    }, [isOpen,openFilters,precioFiltrado,filters]);

    // LIMPIAR TODO
    const limpiarFiltros = () => {
        setFilters({});
        setPriceFilterTouched(false);
        setPriceRange({
            min: priceLimits.min,
            max: priceLimits.max
        });
        setMinInput(String(priceLimits.min));
        setMaxInput(String(priceLimits.max));
    };

    // INPUT PRECIO MIN
    const handleMinInput = (e) => {
        const soloNumeros =
            e.target.value.replace(/\D/g, "");
        setMinInput(soloNumeros);
    };

    // CONFIRMAR MIN
    const confirmarMin = () => {
        if (minInput === "") {
            setMinInput(String(priceRange.min));
            return;
        }
        const value = Number(minInput);
        const nuevoMin = Math.min(
            Math.max(value, priceLimits.min),
            priceRange.max
        );
        setPriceRange(prev => ({
            ...prev,
            min: nuevoMin
        }));
        setMinInput(String(nuevoMin));
        setPriceFilterTouched(true);
    };

    // INPUT PRECIO MAX
    const handleMaxInput = (e) => {
        const soloNumeros =
            e.target.value.replace(/\D/g, "");
        setMaxInput(soloNumeros);
    };

    // CONFIRMAR MAX
    const confirmarMax = () => {
        if (maxInput === "") {
            setMaxInput(String(priceRange.max));
            return;
        }
        const value = Number(maxInput);
        const nuevoMax = Math.max(
            Math.min(value, priceLimits.max),
            priceRange.min
        );
        setPriceRange(prev => ({
            ...prev,
            max: nuevoMax
        }));
        setMaxInput(String(nuevoMax));
        setPriceFilterTouched(true);
    };

    // TECLADO MIN
    const handleMinKeyDown = (e) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            const actual = Number(minInput || priceRange.min);
            const value = Math.min(
                actual + 1,
                priceRange.max
            );
            setMinInput(String(value));
            setPriceRange(prev => ({
                ...prev,
                min: value
            }));
            setPriceFilterTouched(true);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            const actual = Number(minInput || priceRange.min);
            const value = Math.max(
                actual - 1,
                priceLimits.min
            );
            setMinInput(String(value));
            setPriceRange(prev => ({
                ...prev,
                min: value
            }));
            setPriceFilterTouched(true);
            return;
        }
        const permitidas = ["Backspace","Delete","Tab","ArrowLeft","ArrowRight","Home","End"];
        if (permitidas.includes(e.key)) {
            return;
        }
        if (e.ctrlKey || e.metaKey) {
            return;
        }
        if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };

    // TECLADO MAX
    const handleMaxKeyDown = (e) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            const actual = Number(maxInput || priceRange.max);
            const value = Math.min(
                actual + 1,
                priceLimits.max
            );
            setMaxInput(String(value));
            setPriceRange(prev => ({
                ...prev,
                max: value
            }));
            setPriceFilterTouched(true);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            const actual = Number(maxInput || priceRange.max);
            const value = Math.max(
                actual - 1,
                priceRange.min
            );
            setMaxInput(String(value));
            setPriceRange(prev => ({
                ...prev,
                max: value
            }));
            setPriceFilterTouched(true);
            return;
        }
        const permitidas = ["Backspace","Delete","Tab","ArrowLeft","ArrowRight","Home","End"];
        if (permitidas.includes(e.key)) {
            return;
        }
        if (e.ctrlKey || e.metaKey) {
            return;
        }
        if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };
    
    const minActual = Number.isFinite(priceRange.min) ? priceRange.min : priceLimits.min;
    const maxActual = Number.isFinite(priceRange.max) ? priceRange.max : priceLimits.max;

    // SLIDER MIN
    const handleMinSlider = (e) => {
        const value = Number(e.target.value);
        const nuevoMin = Math.min(
            value,
            priceRange.max
        );
        setPriceRange(prev => ({
            ...prev,
            min: nuevoMin
        }));
        setMinInput(String(nuevoMin));
        setPriceFilterTouched(true);
    };

    // SLIDER MAX
    const handleMaxSlider = (e) => {
        const value = Number(e.target.value);
        const nuevoMax = Math.max(
            value,
            priceRange.min
        );
        setPriceRange(prev => ({
            ...prev,
            max: nuevoMax
        }));
        setMaxInput(String(nuevoMax));
        setPriceFilterTouched(true);
    };

    // PORCENTAJES SLIDER
    const rangoTotal = priceLimits.max - priceLimits.min;
    const minPercent = rangoTotal > 0
                        ? (
                            (priceRange.min - priceLimits.min) /
                            rangoTotal
                        ) * 100
                        : 0;
    const maxPercent =
        rangoTotal > 0
            ? (
                (priceRange.max - priceLimits.min) /
                rangoTotal
            ) * 100
            : 100;
    const thumbsCerca = rangoTotal > 0 && (priceRange.max - priceRange.min) / rangoTotal < 0.04;
    const minZIndex = activeThumb === "min" || (thumbsCerca && activeThumb !== "max")
                    ? 40
                    : 20;
    const maxZIndex = activeThumb === "max" || (thumbsCerca && activeThumb !== "min")
                    ? 40
                    : 20;
    return (
        <div className="max-w-7xl mx-auto px-8 mb-12">
            <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-sm overflow-hidden">
                {/* CABECERA FILTROS */}
                <button
                    type="button"
                    onClick={() => setIsOpen(prev => !prev)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-neutral-50 transition"
                >
                    <div className="flex items-center gap-3">
                        <i
                            data-lucide="sliders-horizontal"
                            className="w-5 h-5"
                        />
                        <span className="font-bold uppercase tracking-widest text-sm">
                            Filtros
                        </span>
                        {filtrosActivos > 0 && (
                            <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex
                                            items-center justify-center">
                                {filtrosActivos}
                            </span>
                        )}
                    </div>
                    <i data-lucide={isOpen
                                        ? "chevron-up"
                                        : "chevron-down"
                                    }
                        className="w-5 h-5"
                    />
                </button>

                {/* CONTENIDO */}
                {isOpen && (
                    <div className="border-t border-neutral-100 px-6 pb-6">
                        {/* ATRIBUTOS */}
                        {Object.entries(options).map(
                            ([nombre, valores]) => {
                                const abierto = !!openFilters[nombre];
                                const valorActivo = filters[nombre];
                                return (
                                    <div key={nombre}
                                        className="border-b border-neutral-100"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleFilter(nombre)}
                                            className="w-full py-5 flex items-center justify-between text-left
                                                    hover:bg-neutral-50 transition"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                                                    {nombre}
                                                </span>
                                                {valorActivo && (
                                                    <span className="text-xs font-bold text-black truncate">
                                                        {valorActivo}
                                                    </span>
                                                )}
                                            </div>
                                            <i data-lucide={abierto
                                                                ? "chevron-up"
                                                                : "chevron-down"
                                                            }
                                                className="w-4 h-4 shrink-0"
                                            />
                                        </button>
                                        {abierto && (
                                            <div className="pb-5 flex flex-wrap gap-2">
                                                {valores.map(
                                                    valor => {
                                                        const activo = filters[nombre] === valor;
                                                        const disponible = isOptionAvailable(nombre,valor);
                                                        return (
                                                            <button
                                                                key={valor}
                                                                type="button"
                                                                disabled={!disponible}
                                                                onClick={() => handleFilterChange(nombre,valor)}
                                                                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all                                                                     
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
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        )}

                        {/* PRECIO */}
                        <div className="border-b border-neutral-100">
                            <button
                                type="button"
                                onClick={() => toggleFilter("precio")}
                                className="w-full py-5 flex items-center justify-between 
                                        text-left hover:bg-neutral-50 transition"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                                        Precio
                                    </span>
                                    {precioFiltrado && (
                                        <span className="text-xs font-bold text-black truncate">                                            min.${priceRange.min}
                                            {" — "}
                                            max.${priceRange.max}
                                        </span>
                                    )}
                                </div>
                                <i
                                    data-lucide={openFilters.precio
                                                        ? "chevron-up"
                                                        : "chevron-down"
                                                }
                                    className="w-4 h-4 shrink-0"
                                />
                            </button>

                            {/* CONTENIDO PRECIO */}
                            {openFilters.precio && (
                                <div className="pb-7">
                                    {/* INPUTS */}
                                    <div className="flex items-center justify-center gap-4 mb-6">
                                        <span className="text-neutral-300">
                                            Min.$
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={minInput}
                                            onFocus={e => e.target.select()}
                                            onChange={handleMinInput}
                                            onBlur={confirmarMin}
                                            onKeyDown={handleMinKeyDown}
                                            className="w-32 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-bold
                                                    tabular-nums text-center outline-none focus:border-black transition "
                                        />
                                        <span className="text-neutral-300">
                                            —
                                        </span>
                                        <span className="text-neutral-300">
                                            Max.$
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={maxInput}
                                            onFocus={e => e.target.select()}
                                            onChange={handleMaxInput}
                                            onBlur={confirmarMax}
                                            onKeyDown={handleMaxKeyDown}
                                            className="w-32 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-bold 
                                                    tabular-nums text-center outline-none focus:border-black transition"
                                        />
                                    </div>

                                    {/* SLIDER */}
                                    <div className="relative h-8 mt-2">
                                        <div className="absolute left-0 right-0 top-1/2 h-1 
                                                        -translate-y-1/2 rounded-full bg-neutral-200" 
                                        />
                                        <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full 
                                                        bg-black pointer-events-none"
                                            style={{left: `${minPercent}%`,right: `${100 - maxPercent}%`,}}
                                        />
                                        <input
                                            type="range"
                                            min={priceLimits.min}
                                            max={priceLimits.max}
                                            step="1"
                                            value={minActual}
                                            onChange={handleMinSlider}
                                            onPointerDown={() => setActiveThumb("min")}
                                            style={{ zIndex: minZIndex }}
                                            className="price-slider absolute inset-0 w-full h-8 
                                                        appearance-none bg-transparent pointer-events-none  
                                            "
                                        />

                                        <input
                                            type="range"
                                            min={priceLimits.min}
                                            max={priceLimits.max}
                                            step="1"
                                            value={maxActual}
                                            onChange={handleMaxSlider}
                                            onPointerDown={() => setActiveThumb("max")}
                                            style={{ zIndex: maxZIndex }}
                                            className="price-slider absolute inset-0 w-full h-8 
                                                        appearance-none bg-transparent pointer-events-none                                    
                                            "
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* LIMPIAR */}
                        <AnimatePresence initial={false}>
                            {filtrosActivos > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                        height: {
                                            duration: 0.5,
                                            ease: [0.22, 1, 0.36, 1]
                                        },
                                        opacity: {duration: 0.3}
                                    }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-5">
                                        <button
                                            type="button"
                                            onClick={limpiarFiltros}
                                            className="text-xs font-bold uppercase tracking-widest
                                                    text-neutral-400 hover:text-black transition-colors"
                                        >
                                            Limpiar filtros
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}