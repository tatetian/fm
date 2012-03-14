function DateConstants (){
    function refresh() {
        // do some calculation
        var oneDay = 24 * 60 * 60 * 1000;
        var now = new Date();
        var today = new Date(now.getFullYear(), 
                             now.getMonth(),
                             now.getDate());
        var tomorrow = new Date( today.getTime() + oneDay );
        var yesterday = new Date( today.getTime() - oneDay );
        var day = today.getDay();   /*  SUN --0, MON --1, ..., SAT --6 */
        if(day == 0) day = 7;       /* now SUN is 7 */
        var thisWeek = new Date( today.getTime() 
                               - oneDay * (day-1) );
        var lastWeek = new Date( thisWeek.getTime() - 7 * oneDay );
        var thisMonth = new Date( now.getFullYear(), 
                                  now.getMonth(),
                                  1 );
        var lastMonth = new Date( thisMonth.getTime() - oneDay );
        lastMonth = new Date( lastMonth.getFullYear(), 
                              lastMonth.getMonth(),
                              1);
        var thisYear = new Date( now.getFullYear(), 0, 1);  // 0 is Jan
        // set constants
        DateConstants.TODAY = today.getTime();
        DateConstants.YESTERDAY = yesterday.getTime();
        DateConstants.THIS_WEEK = thisWeek.getTime();
        DateConstants.LAST_WEEK = lastWeek.getTime();
        DateConstants.THIS_MONTH = thisMonth.getTime();
        DateConstants.LAST_MONTH = lastMonth.getTime();
        DateConstants.THIS_YEAR = thisYear.getTime();
        // refresh the variable at the end of day
        setTimeout( refresh, tomorrow.getTime() - now.getTime() );
    };
    refresh();
}
DateConstants();
