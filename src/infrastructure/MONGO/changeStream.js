export async function getChangeStream(db,collectionName,aggregate=[],options={}, onChange) {
    const collection = db.collection(collectionName);
    const changeStream = collection.watch(aggregate,options);
    changeStream.on('change', (next) => {
      onChange(next,changeStream.resumeToken); 
    });
  }

