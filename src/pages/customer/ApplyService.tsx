import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, FileText, IndianRupee, Loader2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

export default function ApplyService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState(false);
  const [desc, setDesc] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Mock service data based on id, normally we'd fetch this
  const serviceName = id === '1' ? 'Community Certificate' : 
                      id === '2' ? 'Income Certificate' : 
                      id === '3' ? 'Nativity Certificate' : 'Other Certificate';
  const fee = 150;
  
  const service = {
    name: serviceName,
    fee: fee,
    requiredDoc: 'Address Proof (PDF, JPG, PNG - Max 2MB)'
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setFileSuccess(false);
    setDownloadUrl(null);

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFileError('File size exceeds 2MB limit.');
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Only PDF, JPG, PNG are allowed.');
      return;
    }

    setUploading(true);
    setProgress(0);

    const storageRef = ref(storage, `documents/${user?.uid}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Simulate 5-7 second processing by artificially slowing down progress visually,
    // though firebase might upload it faster. Let's combine actual upload with a delay.
    let simulatedProgress = 0;
    const interval = setInterval(() => {
      simulatedProgress += 2;
      if (simulatedProgress <= 90) {
        setProgress(simulatedProgress);
      }
    }, 100);

    uploadTask.on('state_changed',
      (snapshot) => {
        // We can track actual bytes but we want it to feel like it's processing for at least 5 seconds
      },
      (error) => {
        clearInterval(interval);
        setUploading(false);
        setFileError('Upload failed: ' + error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setTimeout(() => {
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
              setUploading(false);
              setFileSuccess(true);
              setDownloadUrl(url);
            }, 500);
          }, 3000); // Add a 3 second delay to simulate scanning
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileSuccess || !downloadUrl) {
      setFileError('Please upload a valid document first.');
      return;
    }
    
    if (!user) return;

    try {
      // Create application
      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        serviceId: id,
        serviceName: service.name,
        description: desc,
        documentUrl: downloadUrl,
        status: 'Under Review',
        timeline: ['Submitted', 'Under Review'],
        fee: service.fee + 20,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      alert('Application submitted successfully!');
      navigate('/customer/applications');
    } catch (err: any) {
      setFileError('Failed to submit application: ' + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-4">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground to-accent-foreground">
          Apply for {service.name}
        </h1>
        <p className="text-muted-foreground mt-1">Fill in the details and upload documents securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-6">
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Additional Information</label>
              <textarea 
                rows={4}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Briefly state your purpose for this certificate..."
                className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex justify-between">
                <span>Upload Document</span>
                <span className="text-muted-foreground text-xs">{service.requiredDoc}</span>
              </label>
              
              <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 overflow-hidden
                ${fileError ? 'border-red-400 bg-red-400/5' : fileSuccess ? 'border-emerald-400 bg-emerald-400/5' : 'border-primary/30 hover:border-primary bg-primary/5'}
              `}>
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                  accept=".pdf, .jpg, .jpeg, .png"
                />
                
                {/* Progress Bar Background */}
                {uploading && (
                   <div 
                     className="absolute left-0 bottom-0 h-1 bg-primary transition-all duration-300"
                     style={{ width: `${progress}%` }}
                   />
                )}

                <div className="pointer-events-none flex flex-col items-center gap-2 relative z-0">
                  {uploading ? (
                    <Loader2 className="text-primary mb-2 animate-spin" size={32} />
                  ) : fileSuccess ? (
                    <CheckCircle className="text-emerald-500 mb-2" size={32} />
                  ) : fileError ? (
                    <AlertCircle className="text-red-500 mb-2" size={32} />
                  ) : (
                    <Upload className="text-primary mb-2" size={32} />
                  )}
                  
                  <span className={`font-medium ${uploading ? 'text-primary' : fileError ? 'text-red-600' : fileSuccess ? 'text-emerald-600' : 'text-primary'}`}>
                    {uploading ? `Processing... ${Math.round(progress)}%` : fileSuccess ? 'Document Ready' : fileError ? 'Upload Failed' : 'Click or drag file to upload'}
                  </span>
                  
                  {!uploading && !fileSuccess && !fileError && (
                    <span className="text-xs text-muted-foreground">Supported format: PDF, JPEG, PNG</span>
                  )}
                  
                  {fileSuccess && downloadUrl && (
                    <a href={downloadUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline mt-2 relative z-20 pointer-events-auto">Preview Document</a>
                  )}
                </div>
              </div>
              
              {fileError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {fileError}</p>}
              {fileSuccess && <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle size={12}/> File validated and uploaded securely</p>}
            </div>

            <button disabled={uploading} type="submit" className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
              Proceed to Payment
            </button>
          </form>
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
              <IndianRupee size={18} /> Payment Summary
            </h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-medium">₹{service.fee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-medium">₹20</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border/50 font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{service.fee + 20}</span>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 text-primary font-medium mb-1 text-sm">
                <FileText size={16} /> Information
              </div>
              <p className="text-xs text-muted-foreground">
                Payment gateway securely processes your transaction. After successful payment, a unique Application ID will be generated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
