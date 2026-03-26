import React from 'react';

export default function ActivitySidebar() {
  return (
    <aside className="hidden xl:flex flex-col w-[320px] shrink-0 border-l border-border bg-surface h-[calc(100vh-72px)] sticky top-[72px] overflow-y-auto p-6">
      <div className="mb-8">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Urgently Task</h3>
        <div className="space-y-4">
          <TaskProgress label="Fix API Latency" progress={85} color="bg-status-overdue" />
          <TaskProgress label="Update Database Schema" progress={45} color="bg-status-priority" />
          <TaskProgress label="Refactor Contour Logic" progress={12} color="bg-secondary" />
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">New Chat</h3>
        <div className="space-y-3">
          <ChatItem name="Sarah Jenkins" msg="Can you check the payload data?" />
          <ChatItem name="Mike Ross" msg="Deployment looks good to go!" />
        </div>
      </div>
    </aside>
  );
}

function TaskProgress({ label, progress, color }: { label: string, progress: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-caption mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">{progress}%</span>
      </div>
      <div className="h-2 w-full bg-border rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function ChatItem({ name, msg }: { name: string, msg: string }) {
  return (
    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors mt-2">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-primary font-medium text-xs shrink-0 border border-border">
        {name.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-caption text-gray-600 truncate w-[200px]">{msg}</p>
      </div>
    </div>
  );
}
