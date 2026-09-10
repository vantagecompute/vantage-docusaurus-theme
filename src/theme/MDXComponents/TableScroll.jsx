/**
 * A markdown table inside a horizontal scroll region.
 *
 * The theme frames tables with a border and a radius. Doing that on the table
 * itself needed `overflow: hidden`, which removed the `display: block;
 * overflow-x: auto` Docusaurus ships for wide tables, and on a 345px phone
 * column a four-column reference table squeezed to 61px columns and 171px
 * rows. The wrapper carries the frame now (see `.table-scroll` in
 * src/css/custom.css); the table keeps its natural width and scrolls.
 *
 * `role="region"` plus `tabIndex` so a keyboard user can reach and scroll it.
 */
export default function TableScroll(props) {
  return (
    <div className="table-scroll" role="region" aria-label="Table, scrolls horizontally" tabIndex={0}>
      <table {...props} />
    </div>
  );
}
