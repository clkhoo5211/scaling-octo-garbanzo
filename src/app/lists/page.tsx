"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useClerkUser as useUser } from "@/lib/hooks/useClerkUser";
import {
  List,
  Plus,
  Edit2,
  Trash2,
  Users,
  Globe,
  Lock,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import {
  useLists,
  useCreateList,
  useUpdateList,
  useDeleteList,
  useListSubscriptions,
  useSubscribeToList,
  useUnsubscribeFromList,
} from "@/lib/hooks/useLists";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

export default function ListsPage() {
  const { user, isLoaded } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const { data: lists, isLoading } = useLists(
    user ? { userId: user.id } : undefined
  );
  const { data: subscriptions } = useListSubscriptions(user?.id || null);
  const createListMutation = useCreateList();
  const updateListMutation = useUpdateList();
  const deleteListMutation = useDeleteList();
  const subscribeMutation = useSubscribeToList();
  const unsubscribeMutation = useUnsubscribeFromList();
  const { addToast } = useToast();

  const subscribedListIds = new Set(subscriptions?.map((s) => s.list_id) || []);

  if (!isLoaded) {
    return <LoadingState message="Loading..." fullScreen />;
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            title="Sign in required"
            message="Please sign in to create and manage lists"
            icon={<List className="w-12 h-12 text-gray-400" />}
          />
        </div>
      </ErrorBoundary>
    );
  }

  const handleCreateList = async () => {
    if (!listName.trim()) {
      addToast({ message: "List name is required", type: "error" });
      return;
    }

    try {
      await createListMutation.mutateAsync({
        name: listName.trim(),
        description: listDescription.trim() || undefined,
        isPublic,
      });
      addToast({ message: "List created successfully", type: "success" });
      setShowCreateModal(false);
      setListName("");
      setListDescription("");
      setIsPublic(false);
    } catch (error) {
      addToast({ message: "Failed to create list", type: "error" });
    }
  };

  const handleUpdateList = async (listId: string) => {
    if (!listName.trim()) {
      addToast({ message: "List name is required", type: "error" });
      return;
    }

    try {
      await updateListMutation.mutateAsync({
        listId,
        name: listName.trim(),
        description: listDescription.trim() || undefined,
        isPublic,
      });
      addToast({ message: "List updated successfully", type: "success" });
      setEditingList(null);
      setListName("");
      setListDescription("");
      setIsPublic(false);
    } catch (error) {
      addToast({ message: "Failed to update list", type: "error" });
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this list?")) return;

    try {
      await deleteListMutation.mutateAsync(listId);
      addToast({ message: "List deleted successfully", type: "success" });
    } catch (error) {
      addToast({ message: "Failed to delete list", type: "error" });
    }
  };

  const handleSubscribe = async (listId: string) => {
    try {
      await subscribeMutation.mutateAsync(listId);
      addToast({ message: "Subscribed to list", type: "success" });
    } catch (error) {
      addToast({ message: "Failed to subscribe", type: "error" });
    }
  };

  const handleUnsubscribe = async (listId: string) => {
    try {
      await unsubscribeMutation.mutateAsync(listId);
      addToast({ message: "Unsubscribed from list", type: "success" });
    } catch (error) {
      addToast({ message: "Failed to unsubscribe", type: "error" });
    }
  };

  const openCreateModal = () => {
    setListName("");
    setListDescription("");
    setIsPublic(false);
    setShowCreateModal(true);
  };

  const openEditModal = (list: NonNullable<typeof lists>[0]) => {
    setListName(list.name);
    setListDescription(list.description || "");
    setIsPublic(list.is_public);
    setEditingList(list.id);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingList(null);
    setListName("");
    setListDescription("");
    setIsPublic(false);
  };

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Lists
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create curated lists of articles
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Create List
          </Button>
        </div>

        {isLoading ? (
          <LoadingState message="Loading lists..." />
        ) : !lists || lists.length === 0 ? (
          <EmptyState
            title="No lists yet"
            message="Create your first list to organize articles"
            icon={<List className="w-12 h-12 text-gray-400" />}
            action={
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First List
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {list.name}
                    </h3>
                    {list.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {list.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {list.is_public ? (
                      <Globe className="w-4 h-4 text-blue-500" title="Public" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" title="Private" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{list.subscriber_count} subscribers</span>
                  </div>
                  <span>•</span>
                  <span>
                    {formatRelativeTime(new Date(list.created_at).getTime())}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/lists/${list.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  {list.user_id === user.id ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(list)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteList(list.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : subscribedListIds.has(list.id) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnsubscribe(list.id)}
                    >
                      Unsubscribe
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSubscribe(list.id)}
                    >
                      Subscribe
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create List Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={closeModals}
          title="Create New List"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="List Name"
              placeholder="e.g., My Favorite Articles"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              required
            />
            <Input
              label="Description (optional)"
              placeholder="Describe what this list is about"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              multiline
              rows={3}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <label
                htmlFor="isPublic"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Make this list public
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeModals}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateList}
                isLoading={createListMutation.isPending}
              >
                Create List
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit List Modal */}
        {editingList && (
          <Modal
            isOpen={!!editingList}
            onClose={closeModals}
            title="Edit List"
            size="md"
          >
            <div className="space-y-4">
              <Input
                label="List Name"
                placeholder="e.g., My Favorite Articles"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                required
              />
              <Input
                label="Description (optional)"
                placeholder="Describe what this list is about"
                value={listDescription}
                onChange={(e) => setListDescription(e.target.value)}
                multiline
                rows={3}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublicEdit"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <label
                  htmlFor="isPublicEdit"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Make this list public
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModals}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateList(editingList)}
                  isLoading={updateListMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </ErrorBoundary>
  );
}
