import { supabase } from "../lib/supabase";

const SOLD_STATUS = "🔴 Đã bán";
const ACTIVE_STATUS = "🟢 Đang bán";

const SOLD_RETENTION_DAYS = 30;

const SOLD_RETENTION_MS =
  SOLD_RETENTION_DAYS *
  24 *
  60 *
  60 *
  1000;

const IMAGE_BUCKET = "car-images";


function mapSupabaseImage(image) {
  if (!image) return null;

  return {
    id: image.id,
    preview: image.public_url || "",
    name: image.file_name || "",
    storagePath: image.storage_path || "",
    sortOrder: image.sort_order ?? 0,
    isCover: Boolean(image.is_cover),
  };
}


function mapCommitments(metadata = {}) {
  const c = metadata.commitments || {};

  return {
    checked: c.checked ?? true,
    accidentFree: c.accidentFree ?? true,
    engineOriginal: c.engineOriginal ?? true,
    floodFree: c.floodFree ?? true,
    fineFree: c.fineFree ?? true,
  };
}


function mapSupabaseCar(car) {
  if (!car) {
    return null;
  }

  const metadata = car.metadata || {};

  return {
    id: car.id,

    brand: car.brand || "",
    model: car.model || "",
    version: car.version || "",

    year: car.year ?? null,
    color: car.color || "",
    odo: car.odo ?? 0,
    price: car.price ?? 0,

    warranty: car.warranty || "",
    legal: car.legal || "",

    status: car.status || ACTIVE_STATUS,

    soldAt: car.sold_at || null,

    notes: car.notes || "",

    images: (car.car_images || [])
      .map(mapSupabaseImage)
      .filter(Boolean)
      .sort(
        (a, b) =>
          (a.sortOrder || 0) -
          (b.sortOrder || 0)
      ),

    ...mapCommitments(metadata),

    aiContent: metadata.aiContent || {},

    campaignIds:
      metadata.campaignIds || [],

    queueJobIds:
      metadata.queueJobIds || [],

    workPlanIds:
      metadata.workPlanIds || [],

    createdAt: car.created_at || null,
    updatedAt: car.updated_at || null,

    metadata,
  };
}


function mapCarToSupabase(car) {
  return {
    brand: car.brand || "",
    model: car.model || "",
    version: car.version || "",

    year:
      car.year === ""
        ? null
        : (car.year ?? null),

    color: car.color || "",

    odo:
      Number(car.odo) || 0,

    price:
      Number(car.price) || 0,

    warranty: car.warranty || "",
    legal: car.legal || "",

    status:
      car.status || ACTIVE_STATUS,

    sold_at:
      car.soldAt || null,

    notes:
      car.notes || "",

    metadata: {
      ...(car.metadata || {}),

      commitments: {
        checked:
          car.checked ?? true,

        accidentFree:
          car.accidentFree ?? true,

        engineOriginal:
          car.engineOriginal ?? true,

        floodFree:
          car.floodFree ?? true,

        fineFree:
          car.fineFree ?? true,
      },

      aiContent:
        car.aiContent || {},

      campaignIds:
        car.campaignIds || [],

      queueJobIds:
        car.queueJobIds || [],

      workPlanIds:
        car.workPlanIds || [],
    },
  };
}


async function fetchCarImages(carId) {
  const {
    data,
    error,
  } =
    await supabase
      .from("car_images")
      .select("*")
      .eq("car_id", carId)
      .order("sort_order", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return data || [];
}


function dataUrlToBlob(dataUrl) {
  const [header, base64] =
    String(dataUrl).split(",");

  if (!header || !base64) {
    return null;
  }

  const mime =
    header.match(
      /data:(.*?);base64/
    )?.[1] || "image/jpeg";

  const binary = atob(base64);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let i = 0;
    i < binary.length;
    i += 1
  ) {
    bytes[i] =
      binary.charCodeAt(i);
  }

  return new Blob(
    [bytes],
    {
      type: mime,
    }
  );
}


async function uploadCarImage(
  carId,
  image,
  sortOrder
) {
  if (!image) {
    return null;
  }

  let blob = null;

  // ẢNH MỚI:
  // ImageUploader hiện tại giữ Blob tại image.file
  if (
    image.file instanceof Blob
  ) {
    blob = image.file;
  }

  // FALLBACK:
  // hỗ trợ ảnh dạng Data URL cũ
  if (
    !blob &&
    typeof image.preview === "string" &&
    image.preview.startsWith("data:")
  ) {
    blob =
      dataUrlToBlob(
        image.preview
      );
  }

  if (!blob) {
    return image;
  }

  const extension =
    (
      blob.type
        .split("/")[1] ||
      "jpeg"
    ).replace(
      "jpeg",
      "jpg"
    );

  const safeName =
    String(
      image.name ||
      `car-image-${sortOrder + 1}`
    )
      .replace(
        /[^a-zA-Z0-9._-]/g,
        "-"
      )
      .slice(0, 80);

  const path =
    `${carId}/${crypto.randomUUID()}-${safeName || `image.${extension}`}`;


  const {
    error: uploadError,
  } =
    await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(
        path,
        blob,
        {
          contentType:
            blob.type ||
            "image/jpeg",

          upsert: false,
        }
      );

  if (uploadError) {
    throw uploadError;
  }


  const {
    data: publicData,
  } =
    supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(path);


  const {
    data,
    error,
  } =
    await supabase
      .from("car_images")
      .insert({
        car_id: carId,

        storage_path:
          path,

        public_url:
          publicData.publicUrl,

        file_name:
          image.name ||
          `image.${extension}`,

        mime_type:
          blob.type ||
          "image/jpeg",

        file_size:
          blob.size,

        sort_order:
          sortOrder,

        is_cover:
          sortOrder === 0,
      })
      .select()
      .single();

  if (error) {
    await supabase.storage
      .from(IMAGE_BUCKET)
      .remove([path]);

    throw error;
  }

  return mapSupabaseImage(data);
}


async function syncCarImages(
  carId,
  images = [],
  existingRows = null
) {
  const rows =
    Array.isArray(existingRows)
      ? existingRows
      : await fetchCarImages(carId);


  const keptStoragePaths =
    new Set(
      images
        .filter(
          (img) =>
            img?.storagePath
        )
        .map(
          (img) =>
            img.storagePath
        )
    );


  const removed =
    rows.filter(
      (row) =>
        !keptStoragePaths.has(
          row.storage_path
        )
    );


  if (removed.length) {

    const paths =
      removed
        .map(
          (row) =>
            row.storage_path
        )
        .filter(Boolean);

    const ids =
      removed.map(
        (row) =>
          row.id
      );


    if (paths.length) {

      const {
        error: storageError,
      } =
        await supabase.storage
          .from(IMAGE_BUCKET)
          .remove(paths);

      if (storageError) {
        throw storageError;
      }
    }


    const {
      error,
    } =
      await supabase
        .from("car_images")
        .delete()
        .in("id", ids);

    if (error) {
      throw error;
    }
  }


  // UPLOAD ẢNH MỚI SONG SONG
  const result =
    await Promise.all(
      images.map(
        (image, index) => {

          if (
            image?.storagePath
          ) {
            return Promise.resolve(
              image
            );
          }

          return uploadCarImage(
            carId,
            image,
            index
          );
        }
      )
    );


  // UPDATE THỨ TỰ + ẢNH BÌA SONG SONG
  const orderUpdates =
    result
      .map(
        (image, index) => {

          if (!image?.id) {
            return null;
          }

          return supabase
            .from("car_images")
            .update({
              sort_order: index,
              is_cover:
                index === 0,
            })
            .eq(
              "id",
              image.id
            );
        }
      )
      .filter(Boolean);


  const orderResults =
    await Promise.all(
      orderUpdates
    );


  const orderError =
    orderResults.find(
      (result) =>
        result.error
    )?.error;


  if (orderError) {
    throw orderError;
  }


  return result;
}
// ==========================================
// GET ALL CARS
// ==========================================

export async function getCarsFromSupabase() {
  const {
    data,
    error,
  } =
    await supabase
      .from("cars")
      .select("*, car_images(*)")
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (error) {
    throw error;
  }

  return (
    data || []
  ).map(
    mapSupabaseCar
  );
}


// ==========================================
// GET CAR BY ID
// ==========================================

export async function getCarByIdFromSupabase(
  id
) {
  const {
    data,
    error,
  } =
    await supabase
      .from("cars")
      .select("*, car_images(*)")
      .eq(
        "id",
        id
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return mapSupabaseCar(
    data
  );
}


// ==========================================
// CREATE CAR
// ==========================================

export async function createCarInSupabase(
  car
) {
  const {
    data,
    error,
  } =
    await supabase
      .from("cars")
      .insert(
        mapCarToSupabase(
          car
        )
      )
      .select("*")
      .single();

  if (error) {
    throw error;
  }


  try {

    const images =
      await syncCarImages(
        data.id,
        car.images || []
      );


    return mapSupabaseCar({
      ...data,

      car_images:
        images,
    });


  } catch (imageError) {

    // Nếu upload ảnh thất bại,
    // xóa record xe vừa tạo để
    // không để lại xe rác.

    await supabase
      .from("cars")
      .delete()
      .eq(
        "id",
        data.id
      );

    throw imageError;
  }
}


// ==========================================
// UPDATE CAR
// ==========================================

export async function updateCarInSupabase(
  id,
  updatedData
) {

  // Đọc xe + ảnh hiện tại
  // trong cùng một request.

  const {
    data:
      existingCar,
    error:
      readError,
  } =
    await supabase
      .from("cars")
      .select(
        "*, car_images(*)"
      )
      .eq(
        "id",
        id
      )
      .maybeSingle();


  if (readError) {
    throw readError;
  }


  if (!existingCar) {
    throw new Error(
      "Không tìm thấy xe trên Supabase."
    );
  }


  const currentCar =
    mapSupabaseCar(
      existingCar
    );


  const mergedCar = {

    ...currentCar,

    ...updatedData,


    aiContent: {

      ...(currentCar.aiContent || {}),

      ...(updatedData.aiContent || {}),

    },


    campaignIds:
      updatedData.campaignIds ??
      currentCar.campaignIds ??
      [],


    queueJobIds:
      updatedData.queueJobIds ??
      currentCar.queueJobIds ??
      [],


    workPlanIds:
      updatedData.workPlanIds ??
      currentCar.workPlanIds ??
      [],

  };


  // ========================================
  // UPDATE THÔNG TIN XE
  // ========================================

  const {
    data,
    error,
  } =
    await supabase
      .from("cars")
      .update(
        mapCarToSupabase(
          mergedCar
        )
      )
      .eq(
        "id",
        id
      )
      .select("*")
      .single();


  if (error) {
    throw error;
  }


  // ========================================
  // SYNC ẢNH
  //
  // Dùng luôn existingCar.car_images
  // đã lấy ở request phía trên.
  // Không query lại.
  // ========================================

  const images =
    await syncCarImages(
      id,

      mergedCar.images || [],

      existingCar.car_images || []
    );


  return mapSupabaseCar({

    ...data,

    car_images:
      images,

  });
}


// ==========================================
// MARK CAR AS SOLD
// ==========================================

export async function markCarAsSoldInSupabase(
  id
) {

  const soldAt =
    new Date()
      .toISOString();


  const {
    data,
    error,
  } =
    await supabase
      .from("cars")
      .update({

        status:
          SOLD_STATUS,

        sold_at:
          soldAt,

      })
      .eq(
        "id",
        id
      )
      .select(
        "*, car_images(*)"
      )
      .single();


  if (error) {
    throw error;
  }


  return mapSupabaseCar(
    data
  );
}


// ==========================================
// GET SOLD CARS
// ==========================================

export async function getSoldCarsFromSupabase() {

  const {
    data,
    error,
  } =
    await supabase
      .from("cars")
      .select(
        "*, car_images(*)"
      )
      .eq(
        "status",
        SOLD_STATUS
      )
      .order(
        "sold_at",
        {
          ascending: false,
        }
      );


  if (error) {
    throw error;
  }


  return (
    data || []
  ).map(
    mapSupabaseCar
  );
}


// ==========================================
// GET ACTIVE CARS
// ==========================================

export async function getActiveCarsFromSupabase() {

  const {
    data,
    error,
  } =
    await supabase
      .from("cars")
      .select(
        "*, car_images(*)"
      )
      .neq(
        "status",
        SOLD_STATUS
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );


  if (error) {
    throw error;
  }


  return (
    data || []
  ).map(
    mapSupabaseCar
  );
}


// ==========================================
// RESTORE SOLD CAR AS NEW CAR
// ==========================================

// ==========================================
// RESTORE SOLD CAR AS NEW CAR
// ==========================================
//
// Khi nhập lại xe:
//
// 1. Tạo ID xe mới.
// 2. Giữ toàn bộ thông tin xe.
// 3. Reset Campaign / Queue / WorkPlan.
// 4. COPY toàn bộ ảnh từ xe cũ sang xe mới.
// 5. Chỉ khi xe mới + ảnh tạo thành công
//    mới xóa xe Đã bán cũ.
// 6. Xe cũ tự biến mất khỏi mục Đã bán.
//
// ==========================================

export async function restoreSoldCarInSupabase(
  id
) {

  // ========================================
  // 1. LẤY XE CŨ + ẢNH
  // ========================================

  const oldCar =
    await getCarByIdFromSupabase(
      id
    );


  if (!oldCar) {
    throw new Error(
      "Không tìm thấy xe."
    );
  }


  if (
    oldCar.status !==
    SOLD_STATUS
  ) {
    throw new Error(
      "Xe này không nằm trong mục Đã bán."
    );
  }


  // Lưu lại danh sách ảnh cũ
  const oldImages =
    Array.isArray(oldCar.images)
      ? oldCar.images
      : [];


  // ========================================
  // 2. TẠO XE MỚI
  // ========================================

  const newCarData = {

    ...oldCar,

    id:
      undefined,

    status:
      ACTIVE_STATUS,

    soldAt:
      null,

    campaignIds:
      [],

    queueJobIds:
      [],

    workPlanIds:
      [],

    // QUAN TRỌNG:
    // Không truyền ảnh vào createCar.
    // Ảnh sẽ được COPY riêng bên dưới.
    images:
      [],
  };


  delete newCarData.id;


  let newCar = null;


  try {

    // ======================================
    // 3. TẠO RECORD XE MỚI
    // ======================================

    newCar =
      await createCarInSupabase(
        newCarData
      );


    // ======================================
    // 4. COPY ẢNH CŨ → XE MỚI
    // ======================================

    const copiedImages = [];


    for (
      let index = 0;
      index < oldImages.length;
      index += 1
    ) {

      const oldImage =
        oldImages[index];


      if (
        !oldImage?.storagePath
      ) {
        continue;
      }


      const oldPath =
        oldImage.storagePath;


      const fileName =
        String(
          oldImage.name ||
          `image-${index + 1}.jpg`
        )
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "-"
          );


      const newPath =
        `${newCar.id}/${crypto.randomUUID()}-${fileName}`;


      // ------------------------------------
      // COPY FILE TRONG SUPABASE STORAGE
      // ------------------------------------

      const {
        error:
          copyError,
      } =
        await supabase.storage
          .from(
            IMAGE_BUCKET
          )
          .copy(
            oldPath,
            newPath
          );


      if (copyError) {
        throw copyError;
      }


      // ------------------------------------
      // LẤY PUBLIC URL ẢNH MỚI
      // ------------------------------------

      const {
        data:
          publicData,
      } =
        supabase.storage
          .from(
            IMAGE_BUCKET
          )
          .getPublicUrl(
            newPath
          );


      // ------------------------------------
      // TẠO RECORD car_images CHO XE MỚI
      // ------------------------------------

      const {
        data:
          newImage,
        error:
          imageError,
      } =
        await supabase
          .from("car_images")
          .insert({

            car_id:
              newCar.id,

            storage_path:
              newPath,

            public_url:
              publicData.publicUrl,

            file_name:
              oldImage.name ||
              fileName,

            mime_type:
              oldImage.mimeType ||
              "image/jpeg",

            file_size:
              oldImage.size ||
              0,

            sort_order:
              index,

            is_cover:
              index === 0,

          })
          .select()
          .single();


      if (imageError) {
        throw imageError;
      }


      copiedImages.push(
        newImage
      );
    }


    // ======================================
    // 5. XÓA ẢNH + XE CŨ
    // ======================================
    //
    // Chỉ chạy tới đây khi:
    // - xe mới tạo OK
    // - toàn bộ ảnh copy OK
    //
    // ======================================

    const oldStoragePaths =
      oldImages
        .map(
          (image) =>
            image?.storagePath
        )
        .filter(Boolean);


    // Xóa file ảnh cũ khỏi Storage
    if (
      oldStoragePaths.length
    ) {

      const {
        error:
          storageDeleteError,
      } =
        await supabase.storage
          .from(
            IMAGE_BUCKET
          )
          .remove(
            oldStoragePaths
          );


      if (
        storageDeleteError
      ) {
        throw storageDeleteError;
      }
    }


    // Xóa record car_images cũ
    const {
      error:
        oldImagesDeleteError,
    } =
      await supabase
        .from("car_images")
        .delete()
        .eq(
          "car_id",
          id
        );


    if (
      oldImagesDeleteError
    ) {
      throw oldImagesDeleteError;
    }


    // Xóa record xe cũ
    const {
      error:
        oldCarDeleteError,
    } =
      await supabase
        .from("cars")
        .delete()
        .eq(
          "id",
          id
        );


    if (
      oldCarDeleteError
    ) {
      throw oldCarDeleteError;
    }


    // ======================================
    // 6. TRẢ VỀ XE MỚI + ẢNH
    // ======================================

    return {

      ...newCar,

      images:
        copiedImages.map(
          mapSupabaseImage
        ),

    };


  } catch (error) {

    console.error(
      "Restore sold car error:",
      error
    );


    // ======================================
    // ROLLBACK XE MỚI NẾU CÓ LỖI
    // ======================================

    if (newCar?.id) {

      try {

        await deleteCarFromSupabase(
          newCar.id
        );

      } catch (
        rollbackError
      ) {

        console.error(
          "Rollback restore error:",
          rollbackError
        );

      }
    }


    throw error;
  }
}

// ==========================================
// DELETE CAR
// ==========================================

export async function deleteCarFromSupabase(
  id
) {

  const images =
    await fetchCarImages(
      id
    );


  const paths =
    images
      .map(
        (image) =>
          image.storage_path
      )
      .filter(Boolean);


  if (paths.length) {

    const {
      error:
        storageError,
    } =
      await supabase.storage
        .from(
          IMAGE_BUCKET
        )
        .remove(
          paths
        );


    if (storageError) {
      throw storageError;
    }

  }


  const {
    error:
      imageError,
  } =
    await supabase
      .from("car_images")
      .delete()
      .eq(
        "car_id",
        id
      );


  if (imageError) {
    throw imageError;
  }


  const {
    error,
  } =
    await supabase
      .from("cars")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {
    throw error;
  }


  return true;
}


// ==========================================
// SOLD DAYS REMAINING
// ==========================================

export function getSoldDaysRemainingFromSupabase(
  car
) {

  if (
    !car ||
    car.status !==
      SOLD_STATUS ||
    !car.soldAt
  ) {
    return null;
  }


  const soldTime =
    new Date(
      car.soldAt
    ).getTime();


  if (
    Number.isNaN(
      soldTime
    )
  ) {
    return null;
  }


  const remaining =
    SOLD_RETENTION_MS -
    (
      Date.now() -
      soldTime
    );


  if (
    remaining <= 0
  ) {
    return 0;
  }


  return Math.ceil(
    remaining /
      (
        24 *
        60 *
        60 *
        1000
      )
  );
}


// ==========================================
// EXPORT CONSTANTS
// ==========================================

export {
  SOLD_STATUS,
  ACTIVE_STATUS,
  SOLD_RETENTION_DAYS,
};