import "./Tiles.css";

export default function Tiles({ title, count, variant = "small", onClick }) {
    return (
        <div 
            className={`tile tile-${variant}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
            style={onClick ? { cursor: 'pointer' } : {}}
        >
            <h3>{title}</h3>
            {count !== undefined && <p className="tile-count">{count}</p>}
        </div>
    );
}