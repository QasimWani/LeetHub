//class used for storing/querying leetcode question information
export default class LHLocalStorage{
  partitionBaseName = 'lh-storage'; // base name used for partition
  storage = window.localStorage;
  partitions; // chrome's localstorage can hold at most 2KB per key:value pair
  partitionMaxSize = 1900; // holds at max 2KB (1.9KB to be safe) per key:value pair

  constructor(){
    var p = 0
    // check how many partitons of lh-storage exists
    while(this.storage.getItem(`${this.partitionBaseName}-${p}`) != null){
      p ++;
    }
    this.partitions = p // we have p partitions of 2KB, starting from "lh-storage-0"
    console.log(`current partitions: ${this.partitions}`)
  }
  
  // private method (shouldn't be used outside this scope)
  // Method returns question data from local storage partition if partition exists.
  getPartitionData = (partitionName) => {
    const questionData = this.storage.getItem(partitionName)
    if(questionData == null){
      // partition does not exists (should never be the case)
      console.log(`partition ${partitionName} does not exist!`)
      return null;
    }
    return questionData
  }

  // private method (shouldn't be used outside this scope)
  // Method returns size of partition data (in bytes)
  // should only be called if partition is present
  getPartitionSize = (partitionName) => unescape(
    encodeURIComponent(this.getPartitionData(partitionName))
  ).length;

  
  // private method (shouldn't be used outside this scope)
  // Method returns first available partition name. If all partitions are full, creates new one
  firstAvailablePartition = (payload) => {
    var p = 0;
    const payloadSize = unescape(encodeURIComponent(payload)).length // size of data we want to put into partition
    while(p < this.partitions){
      // check to see if partition is too big to include itself with the new data
      const questionData = this.getPartitionData(`${this.partitionBaseName}-${p}`)
      if(questionData != null && 
        this.getPartitionSize(`${this.partitionBaseName}-${p}`) + payloadSize <= this.partitionMaxSize
      ){
        return `${this.partitionBaseName}-${p}`
      }
      p++
    }
    // no partitions available - create new partition
    return this.generatePartition()
  }

  // private method (shouldn't be used outside this scope)
  // Method generates a new partition and returns the partition name (key in local storage)
  generatePartition = () => {
    let partitionData = '';
    const newPartitionName = `${this.partitionBaseName}-${this.partitions}` 
    this.storage.setItem(newPartitionName, partitionData) // creates new partition
    this.partitions++ // increment partitions
    return newPartitionName
  }


  /**
   * Checks to see if question title is stored in local storage and returns full title. If not present in local storage, return null
   * 
   * @param {string} name The name of the question as defined by LeetCode (not slug format)
   * For example, for "1. Two Sum", name should be "Two Sum"
   * @returns {string} The title of the problem following the structure "X. Question Name"
   */
  getQuestionTitle(name){
    // make regex query across all partitions
    var p = 0;
    while(p < this.partitions){
      const questionData = this.getPartitionData(`${this.partitionBaseName}-${p}`)
      // question data is a massive string that contains name and numbers of leetcode questions
      // previously stored on the local machine. It should follow the structure '1. Two Sum; 2. ...'
      if(questionData){
        let match = questionData.match(new RegExp(`\\d+[.]\\s${name}`, "i")) // find match
        if(match){
          return match[0] // eg. returns '1. Two Sum'
        }
      }
      p++
    }
    // question not present in any partitions
    return null;
  }

  /**
   * Adds the full question title into localstorage in the first available partition
   * 
   * @param {string} title The title (with number) of the question as defined by LeetCode (not slug format)
   * For example, for Two Sum, the title should be "1. Two Sum"
   * @returns {int} Status of upload. 0 means all went well. 1 means something went wrong. 2 means title
   *  already exists in local storage
   */
  setQuestionTitle(title){
    
    // check if it isn't already in local storage
    let splitTitle = title.split(/\d+[.][\s]?(.*)/)
    if(!splitTitle){
      console.log(`wrong title format: ${title}`)
      return 1;
    }
    const questionName = splitTitle[1]
    if(this.getQuestionTitle(questionName)){
      console.log(`Question ${title} has already been cached.`)
      return 2;
    }
    
    // find earliest available partition
    const payload = `${title}; `
    let currPartition = this.firstAvailablePartition(payload)

    // add payload to partition
    try{
      let modifiedPartitionData = this.storage.getItem(currPartition) + payload
      this.storage.setItem(currPartition, modifiedPartitionData);
      console.log(`successfuly saved title: ${title}`)
      return 0
    }
    catch(err){
      if (err.name === 'QuotaExceededError') {
        // partition is full (theoretially should never happen as new partition is made)
        console.error('"FIRST AVAILABLE PARTITION" IS FULL')
      }
      else{
        throw err; // could be something else
      }
      return 1;
    }
  }
}