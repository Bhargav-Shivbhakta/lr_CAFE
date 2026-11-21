import { useNavigate } from 'react-router-dom';
import { getHub } from '../registry';
import { ListRow } from '../ui';

/** The "More" hub: every non-tab feature, grouped. New features appear here automatically. */
export function Hub() {
  const nav = useNavigate();
  return (
    <>
      {getHub().map(({ section, items }) => (
        <section key={section}>
          <h2 className="section-title">{section}</h2>
          <div className="list-group">
            {items.map((f) => (
              <ListRow key={f.id} icon={f.icon} title={f.title} subtitle={f.subtitle}
                right={f.status === 'soon' ? <span className="badge-soon">Soon</span> : f.status === 'beta' ? <span className="badge-soon">Beta</span> : undefined}
                onClick={() => nav(`/${f.id}`)} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
