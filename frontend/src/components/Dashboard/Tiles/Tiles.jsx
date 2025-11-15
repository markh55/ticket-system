import "./Tiles.css";

export default function Tiles({ title, count, variant = "small" }) {
    return (
        <div className={`tile tile-${variant}`}>
            <h3>{title}</h3>
            {count && <p className="tile-count">{count}</p>}
        </div>
    );
}