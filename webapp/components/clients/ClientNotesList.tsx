"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  IconNotes,
  IconPlus,
  IconCalendarEvent,
  IconLock,
  IconWorld,
  IconTrash,
} from "@tabler/icons-react";
import {
  createClientNoteAction,
  deleteClientNoteAction,
} from "@/app/actions/client-notes";

interface Note {
  id: string;
  note_type: string;
  content: string;
  is_private: boolean;
  created_at: string;
  session_id: string | null;
}

interface Session {
  id: string;
  title: string;
  session_date: string;
}

interface ClientNotesListProps {
  clientId: string;
  notes: Note[];
  sessions: Session[];
  onUpdate: () => void;
}

export function ClientNotesList({
  clientId,
  notes,
  sessions,
  onUpdate,
}: ClientNotesListProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteType, setNoteType] = useState<"session_note" | "general_note" | "progress_note">(
    "general_note"
  );
  const [content, setContent] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sort notes by date (most recent first)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Note content is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createClientNoteAction({
        clientId,
        noteType,
        content,
        sessionId: selectedSessionId,
        isPrivate,
      });

      if (result.success) {
        setShowAddNote(false);
        setContent("");
        setNoteType("general_note");
        setSelectedSessionId(null);
        setIsPrivate(true);
        onUpdate();
      } else {
        setError(result.error || "Failed to create note");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteClientNoteAction(noteId);
      onUpdate();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case "session_note":
        return "Session Note";
      case "progress_note":
        return "Progress Note";
      case "general_note":
      default:
        return "General Note";
    }
  };

  const getNoteTypeBadge = (type: string) => {
    switch (type) {
      case "session_note":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Session
          </span>
        );
      case "progress_note":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Progress
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-gray-300">
            General
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Note Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAddNote(true)}>
          <IconPlus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
          <IconNotes className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Notes Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Add notes to track progress, session summaries, or general observations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getNoteTypeBadge(note.note_type)}
                  {note.is_private ? (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <IconLock className="w-3 h-3" />
                      Private
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <IconWorld className="w-3 h-3" />
                      Visible to client
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors text-gray-400 hover:text-red-500"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {note.content}
              </p>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {new Date(note.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Dialog */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add Note
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              {error && (
                <Alert type="error" message={error} onDismiss={() => setError(null)} />
              )}

              {/* Note Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Note Type
                </label>
                <div className="flex gap-2">
                  {(["general_note", "session_note", "progress_note"] as const).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => setNoteType(type)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          noteType === type
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600"
                        }`}
                      >
                        {getNoteTypeLabel(type)}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Link to Session (optional) */}
              {noteType === "session_note" && sessions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link to Session (optional)
                  </label>
                  <select
                    value={selectedSessionId || ""}
                    onChange={(e) =>
                      setSelectedSessionId(e.target.value || null)
                    }
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No linked session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.title} -{" "}
                        {new Date(session.session_date).toLocaleDateString("en-GB")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your note..."
                  rows={6}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Privacy */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500 dark:bg-neutral-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Private note (only visible to you)
                </span>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddNote(false);
                  setContent("");
                  setError(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={isSubmitting}>
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
