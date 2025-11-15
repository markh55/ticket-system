import "./Tiles.css";


export default function Tiles({ title, count }) {
    return (
        <div className="tile">
            <h3>{title}</h3>
            <p className="tile-count">{count}</p>
        </div>
    );
}