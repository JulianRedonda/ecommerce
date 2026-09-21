import {
    motion
} from "framer-motion";

export default function Hero() {
    return (
        <header className="pt-32 pb-12 px-8 max-w-7xl mx-auto">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-extrabold tracking-tighter 
                            leading-none mb-12"
            >
                THE{" "}
                <span className="text-neutral-300 italic">
                    SHOP
                </span>
            </motion.h1>
        </header>
    );
}