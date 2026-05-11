import { useState } from 'react';

const EXTERNAL_LINKS = {
  'release-dashboard': '/Puffin_Release_Tool.html#release-dashboard',
  'release-logger': '/Puffin_Release_Tool.html#release-logger',
  consolidate: '/Puffin_Release_Tool.html#consolidate',
  'edit-releases': '/Puffin_Release_Tool.html#edit-releases',
  nbk: '/Puffin_Release_Tool.html#client-nbk',
  warba: '/Puffin_Release_Tool.html#client-warba',
  ku: '/Puffin_Release_Tool.html#client-ku',
  kac: '/Puffin_Release_Tool.html#client-kac',
  'testcase-upload': '/Puffin_Release_Tool.html#testcase-upload',
  'testcase-viewer': '/Puffin_Release_Tool.html#testcase-viewer',
  'testcase-reports': '/Puffin_Release_Tool.html#testcase-reports',
  'jmeter-results': '/Puffin_Release_Tool.html#jmeter-results',
  'jmeter-graphs': '/Puffin_Release_Tool.html#jmeter-graphs',
  'jmeter-config': '/Puffin_Release_Tool.html#jmeter-config',
  'postman-results': '/Puffin_Release_Tool.html#postman-results',
  'postman-graphs': '/Puffin_Release_Tool.html#postman-graphs',
  'postman-config': '/Puffin_Release_Tool.html#postman-config',
  'resource-cpu-memory': '/Puffin_Release_Tool.html#resource-cpu-memory',
  'resource-network': '/Puffin_Release_Tool.html#resource-network',
  'resource-storage': '/Puffin_Release_Tool.html#resource-storage',
};

const SIDEBAR_SECTIONS = [
  {
    id: 'release-mgmt',
    label: 'Release Management',
    items: [
      { id: 'release-dashboard', label: 'Release Dashboard', icon: '📊', type: 'external' },
      { id: 'release-logger', label: 'Release Logger', icon: '📝', type: 'external' },
      { id: 'consolidate', label: 'Consolidate', icon: '📋', type: 'external' },
      { id: 'edit-releases', label: 'Edit Releases', icon: '✏', type: 'external' },
    ],
  },
  {
    id: 'client-wise',
    label: 'Client-wise Testing',
    items: [
      {
        id: 'kfh-cxp',
        label: 'KFH CXP',
        icon: '🏦',
        type: 'group',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: '📊', type: 'internal' },
          { id: 'table', label: 'Records', icon: '📋', type: 'internal' },
          { id: 'insert', label: 'Insert Records', icon: '➕', type: 'internal' },
        ],
      },
      { id: 'nbk', label: 'NBK', icon: '🏛', type: 'external' },
      { id: 'warba', label: 'Warba', icon: '🏢', type: 'external' },
      { id: 'ku', label: 'KU', icon: '🏫', type: 'external' },
      { id: 'kac', label: 'KAC', icon: '✈', type: 'external' },
    ],
  },
  {
    id: 'test-case-mgmt',
    label: 'Test Case Management',
    items: [
      { id: 'testcase-upload', label: 'Upload Excel', icon: '📤', type: 'external' },
      { id: 'testcase-viewer', label: 'Test Case Viewer', icon: '🧪', type: 'external' },
      { id: 'testcase-reports', label: 'Reports', icon: '📈', type: 'external' },
    ],
  },
  {
    id: 'load-testing',
    label: 'Load Testing',
    items: [
      {
        id: 'jmeter',
        label: 'JMeter',
        icon: '⚡',
        type: 'group',
        items: [
          { id: 'jmeter-results', label: 'Results', icon: '📊', type: 'external' },
          { id: 'jmeter-graphs', label: 'Graphs', icon: '📉', type: 'external' },
          { id: 'jmeter-config', label: 'Config', icon: '⚙', type: 'external' },
        ],
      },
      {
        id: 'postman',
        label: 'Postman',
        icon: '📮',
        type: 'group',
        items: [
          { id: 'postman-results', label: 'Results', icon: '📊', type: 'external' },
          { id: 'postman-graphs', label: 'Graphs', icon: '📉', type: 'external' },
          { id: 'postman-config', label: 'Config', icon: '⚙', type: 'external' },
        ],
      },
    ],
  },
  {
    id: 'resource-utilization',
    label: 'Resource Utilization',
    items: [
      { id: 'resource-cpu-memory', label: 'CPU & Memory', icon: '🖥', type: 'external' },
      { id: 'resource-network', label: 'Network', icon: '🌐', type: 'external' },
      { id: 'resource-storage', label: 'Storage', icon: '💾', type: 'external' },
    ],
  },
];

function NavEntry({ item, activeTab, setActiveTab, expandedItems, toggleItem, depth = 0 }) {
  const isGroup = item.type === 'group';
  const isInternal = item.type === 'internal';
  const isExpanded = expandedItems.includes(item.id);
  const isActive = isInternal && activeTab === item.id;
  const paddingLeft = depth === 0 ? '0.75rem' : depth === 1 ? '1.5rem' : '2.25rem';

  if (isGroup) {
    return (
      <div>
        <button
          onClick={() => toggleItem(item.id)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer hover:bg-blue-500/20"
          style={{
            fontFamily: "'DM Mono', monospace",
            color: '#cbd5e1',
            paddingLeft,
          }}
        >
          <span>{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {item.items.map(child => (
              <NavEntry
                key={child.id}
                item={child}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                expandedItems={expandedItems}
                toggleItem={toggleItem}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.type === 'external') {
    return (
      <a
        href={EXTERNAL_LINKS[item.id] ?? '/Puffin_Release_Tool.html'}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer hover:bg-blue-500/20 block"
        style={{
          fontFamily: "'DM Mono', monospace",
          color: '#cbd5e1',
          borderLeft: '2px solid transparent',
          textDecoration: 'none',
          paddingLeft,
        }}
      >
        <span>{item.icon}</span>
        <span>{item.label}</span>
      </a>
    );
  }

  return (
    <button
      onClick={() => setActiveTab(item.id)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer hover:bg-blue-500/20"
      style={{
        fontFamily: "'DM Mono', monospace",
        background: isActive ? '#1e40af' : 'transparent',
        color: isActive ? '#fff' : '#cbd5e1',
        borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
        paddingLeft,
      }}
    >
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
}

export function Sidebar({ activeTab, setActiveTab }) {
  const [expandedSections, setExpandedSections] = useState([
    'release-mgmt',
    'client-wise',
    'kfh-cxp',
  ]);

  const toggleExpanded = (id) => {
    setExpandedSections(prev => (
      prev.includes(id)
        ? prev.filter(entry => entry !== id)
        : [...prev, id]
    ));
  };

  return (
    <aside className="w-56 bg-navy-900 border-r border-slate-800 overflow-y-auto fixed left-0 top-0 bottom-0 z-40">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold"
            style={{ fontFamily: "'DM Mono', monospace" }}>
            P
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              QA <span className="text-blue-400">DASHBOARD</span>
            </h2>
          </div>
        </div>
      </div>

      <nav className="p-4">
        {SIDEBAR_SECTIONS.map(section => (
          <div key={section.id} className="mb-6">
            <button
              onClick={() => toggleExpanded(section.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all uppercase tracking-wider"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              <span>{section.label}</span>
              <span className={`transform transition-transform ${expandedSections.includes(section.id) ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {expandedSections.includes(section.id) && (
              <div className="mt-2 space-y-1">
                {section.items.map(item => (
                  <NavEntry
                    key={item.id}
                    item={item}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    expandedItems={expandedSections}
                    toggleItem={toggleExpanded}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
