// services/FileUploadService.js
import { supabase } from '../supabase/supabaseClient'

class FileUploadService {
    constructor() {
        this.bucketName = 'payment-screenshots';
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    }

    // Validate file before upload
    validateFile(file) {
        if (!file) {
            throw new Error('No file provided');
        }

        if (file.size > this.maxFileSize) {
            throw new Error(`File size must be less than ${this.maxFileSize / (1024 * 1024)}MB`);
        }

        if (!this.allowedTypes.includes(file.type)) {
            throw new Error('Only image files (JPEG, PNG, WebP) are allowed');
        }

        return true;
    }

    // Generate unique filename
    generateFileName(originalName, prefix = 'payment') {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const fileExt = originalName.split('.').pop().toLowerCase();
        return `${prefix}_${timestamp}_${randomString}.${fileExt}`;
    }

    // Upload payment screenshot
    async uploadPaymentScreenshot(file, paymentId = null) {
        try {
            this.validateFile(file);

            const fileName = this.generateFileName(file.name, `payment_${paymentId || 'temp'}`);
            const filePath = `payments/${fileName}`;

            // Upload file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(this.bucketName)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            return {
                path: filePath,
                url: urlData.publicUrl,
                fileName: fileName
            };

        } catch (error) {
            console.error("FileUploadService uploadPaymentScreenshot error:", error);
            throw error;
        }
    }

    // Delete uploaded file
    async deleteFile(filePath) {
        try {
            const { error } = await supabase.storage
                .from(this.bucketName)
                .remove([filePath]);

            if (error) {
                console.error("Delete error:", error);
                throw new Error(`Delete failed: ${error.message}`);
            }

            return true;
        } catch (error) {
            console.error("FileUploadService deleteFile error:", error);
            throw error;
        }
    }

    // Update payment record with screenshot URL
    async updatePaymentScreenshot(paymentId, filePath) {
        try {
            const { data: urlData } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            const { data, error } = await supabase
                .from('payments')
                .update({ payment_screenshot_url: urlData.publicUrl })
                .eq('id', paymentId)
                .select()
                .single();

            if (error) {
                console.error("Update payment screenshot error:", error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error("FileUploadService updatePaymentScreenshot error:", error);
            throw error;
        }
    }

    // Upload and associate with payment in one operation
    async uploadAndAssociateScreenshot(file, paymentId) {
        try {
            // Upload the file
            const uploadResult = await this.uploadPaymentScreenshot(file, paymentId);
            
            // Update the payment record
            const paymentData = await this.updatePaymentScreenshot(paymentId, uploadResult.path);
            
            return {
                upload: uploadResult,
                payment: paymentData
            };
        } catch (error) {
            console.error("FileUploadService uploadAndAssociateScreenshot error:", error);
            throw error;
        }
    }

    // Get file info from URL
    extractFilePathFromUrl(url) {
        try {
            // Extract file path from Supabase storage URL
            const urlParts = url.split('/storage/v1/object/public/');
            if (urlParts.length > 1) {
                const pathParts = urlParts[1].split('/');
                if (pathParts[0] === this.bucketName) {
                    return pathParts.slice(1).join('/');
                }
            }
            return null;
        } catch (error) {
            console.error("Error extracting file path:", error);
            return null;
        }
    }

    // Create upload progress handler
    createProgressHandler(onProgress) {
        return (progress) => {
            if (onProgress && typeof onProgress === 'function') {
                const percentage = Math.round((progress.loaded / progress.total) * 100);
                onProgress(percentage);
            }
        };
    }

    // Batch upload multiple files
    async uploadMultipleFiles(files, prefix = 'payment') {
        try {
            const uploadPromises = files.map(async (file, index) => {
                try {
                    return await this.uploadPaymentScreenshot(file, `${prefix}_${index}`);
                } catch (error) {
                    return { error: error.message, fileName: file.name };
                }
            });

            const results = await Promise.all(uploadPromises);
            
            const successful = results.filter(result => !result.error);
            const failed = results.filter(result => result.error);

            return {
                successful,
                failed,
                totalCount: files.length,
                successCount: successful.length,
                failureCount: failed.length
            };
        } catch (error) {
            console.error("FileUploadService uploadMultipleFiles error:", error);
            throw error;
        }
    }

    // Check if bucket exists and create if needed (admin function)
    async ensureBucketExists() {
        try {
            const { data: buckets, error: listError } = await supabase.storage.listBuckets();
            
            if (listError) {
                console.error("Error listing buckets:", listError);
                return false;
            }

            const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);
            
            if (!bucketExists) {
                const { data, error: createError } = await supabase.storage.createBucket(this.bucketName, {
                    public: true,
                    allowedMimeTypes: this.allowedTypes,
                    fileSizeLimit: this.maxFileSize
                });

                if (createError) {
                    console.error("Error creating bucket:", createError);
                    return false;
                }

                console.log("Bucket created successfully:", data);
            }

            return true;
        } catch (error) {
            console.error("Error ensuring bucket exists:", error);
            return false;
        }
    }
}

export default new FileUploadService();