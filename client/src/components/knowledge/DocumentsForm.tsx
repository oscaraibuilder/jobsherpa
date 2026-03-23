import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useKnowledgeEngine } from "@/context/KnowledgeEngineContext";
import type { DocumentItem } from "@/types/knowledgeEngine";
import { Plus, Trash2, FileText, Link2, Upload, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentsFormProps {
  onClose: () => void;
}

export function DocumentsForm({ onClose }: DocumentsFormProps) {
  const { state, updateState } = useKnowledgeEngine();
  const [documents, setDocuments] = useState<DocumentItem[]>(state.documents);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const isSignedIn = !!state.linkedInProfile;

  const addLink = () => {
    if (!newLabel.trim()) return;
    
    const newDoc: DocumentItem = {
      id: crypto.randomUUID(),
      kind: "link",
      label: newLabel.trim(),
      url: newUrl.trim() || undefined,
    };
    setDocuments([...documents, newDoc]);
    setNewLabel("");
    setNewUrl("");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("UPLOAD FAILED", res.status, text);
        throw new Error(`Upload failed: ${res.status} - ${text}`);
      }

      const data = await res.json();
      
      const newDoc: DocumentItem = {
        id: data.id || crypto.randomUUID(),
        kind: "file",
        label: file.name.replace(/\.[^/.]+$/, ""),
        url: data.url,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      };
      
      setDocuments([...documents, newDoc]);
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleSave = () => {
    updateState({ documents });
    onClose();
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        data-testid="input-file-upload"
      />
      <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Click below to upload a file
        </p>
        {!isSignedIn && (
          <Alert className="mb-3 text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in with LinkedIn first to upload files. Close this dialog and click "Sign in with LinkedIn" on the Knowledge Engine page.
            </AlertDescription>
          </Alert>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !isSignedIn}
          data-testid="button-upload-file"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Supported: PDF, DOC, DOCX, TXT (max 10MB)
        </p>
      </div>

      <div className="space-y-4">
        <Label>Add Link or Reference</Label>
        <div className="grid grid-cols-1 gap-3">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g., Portfolio, GitHub, Writing Sample)"
            data-testid="input-doc-label"
          />
          <div className="flex gap-2">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="URL (optional)"
              className="flex-1"
              data-testid="input-doc-url"
            />
            <Button onClick={addLink} data-testid="button-add-document">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <Label>Added Documents & Links</Label>
          <div className="space-y-2">
            {documents.map(doc => (
              <Card key={doc.id} className="overflow-visible">
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {doc.kind === "link" ? (
                      <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{doc.label}</p>
                      {doc.kind === "link" && doc.url && (
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate block"
                        >
                          {doc.url}
                        </a>
                      )}
                      {doc.kind === "file" && doc.fileName && (
                        <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDocument(doc.id)}
                    data-testid={`button-remove-doc-${doc.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">No documents or links added yet.</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
          Cancel
        </Button>
        <Button onClick={handleSave} data-testid="button-save-documents">
          Save
        </Button>
      </div>
    </div>
  );
}
